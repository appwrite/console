import { anthropic, AnthropicProviderOptions } from "@ai-sdk/anthropic";
import { Agent } from "@mastra/core";
import { fileTools } from "../tools/file-tools";
import { smoothStream } from "ai";
import { RuntimeContextType } from "../utils/runtime-context";
import { AnthropicExtendedProviderOptions } from "@/lib/types";

export const architectAgent = new Agent({
  name: "Software Architect Agent",
  instructions: `
You are a Software Architect.

NOTE: It is ALWAYS better to use the readMultipleFilesInParallel tool to read multiple files in parallel. This will make the execution a lot faster and save the company a lot of money.
  `,
  model: anthropic("claude-sonnet-4-20250514"),
  // model: anthropic("claude-3-7-sonnet-20250219"),
  // model: google("gemini-2.5-pro"),
  // model: openai("gpt-4.1-nano"),
  tools: {
    readFile: fileTools.readFileTool,
    readMultipleFilesInParallel: fileTools.readMultipleFilesInParallelTool,
  },
  defaultStreamOptions: ({ runtimeContext }: { runtimeContext: RuntimeContextType }) => {
    const abortSignal = runtimeContext.get("signal");
    return {
      temperature: 0.8,
      abortSignal,
      experimental_transform: smoothStream({
        delayInMs: 10,
        chunking: "word",
      }),
      headers: {
        "anthropic-beta": [
          "token-efficient-tools-2025-02-19",
          "fine-grained-tool-streaming-2025-05-14",
          "extended-cache-ttl-2025-04-11",
        ].join(","),
      },
      providerOptions: {
        thinking: {
          type: "enabled",
          budgetTokens: 12000
        },
        sendReasoning: true,
      } as any
    };
  },
});
