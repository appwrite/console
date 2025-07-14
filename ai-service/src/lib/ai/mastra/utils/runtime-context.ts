import { RuntimeContext } from "@mastra/core/runtime-context";
import { InferUITool } from "ai";
import { fileTools } from "../tools/file-tools";
import { UIMessage, UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { checkpointDataUIPartSchema } from "../../custom-parts/checkpoint";

export type WriterType = UIMessageStreamWriter<UIMessage<unknown, {
  checkpoint: z.infer<typeof checkpointDataUIPartSchema>;
}, {
  readFile: InferUITool<typeof fileTools.readFileTool>;
  writeFile: InferUITool<typeof fileTools.writeFileTool>;
}>>;
export type RuntimeContextPayload = {
  writer: WriterType;
  skipWritingToolCalls?: boolean;
  restMessages?: any[];
  isFirstMessage?: boolean;
  signal?: AbortSignal;
}
export type RuntimeContextType = RuntimeContext<RuntimeContextPayload>;

export const cloneRuntimeContext = (runtimeContext: RuntimeContextType, overrides?: Partial<RuntimeContextPayload>): RuntimeContextType => {
  const newRuntimeContext = new RuntimeContext<RuntimeContextPayload>();
  const entries = runtimeContext.entries();
  for (const [key, value] of entries) {
    newRuntimeContext.set(key as keyof RuntimeContextPayload, value);
  }

  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      newRuntimeContext.set(key as keyof RuntimeContextPayload, value);
    }
  }

  return newRuntimeContext;
}

export const createRuntimeContext = ({ writer }: { writer: WriterType }): RuntimeContextType => {
  const runtimeContext = new RuntimeContext<RuntimeContextPayload>();
  runtimeContext.set("skipWritingToolCalls", false);
  runtimeContext.set("writer", writer as WriterType);
  runtimeContext.set("restMessages", []);
  runtimeContext.set("isFirstMessage", true);
  return runtimeContext;
};

const createMockWriter = (): WriterType => {
  return {
    write: () => {},
  } as unknown as WriterType;
};

export const getWriterFromContext = (runtimeContext: RuntimeContextType): WriterType => {
  const writer = runtimeContext.get("writer") as WriterType;
  if (!writer) {
    return createMockWriter();
  }
  return writer;
};

