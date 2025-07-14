import { anthropic } from "@ai-sdk/anthropic";
import { Agent, createTool } from "@mastra/core";
import { fileTools } from "../tools/file-tools";
import { smoothStream } from "ai";
import z from "zod";
import { RuntimeContextType } from "../utils/runtime-context";
import { vercel } from "@ai-sdk/vercel"

export const developerAgent = new Agent({
  name: "Software Developer Agent",
  instructions: `
You are a Software Developer.

# Tools
You have a bunch of tools available to you. You can use them to read files, write files, list files in a directory, delete files, move files, and more.
NOTE: It is ALWAYS better to use the readMultipleFilesInParallel tool to read multiple files in parallel. This will make the execution a lot faster and save the company a lot of money.

# Rules

You must always use the reportDone tool to report to the architect that you are done. You should only use this tool if you are done with the task. This will be your last tool call.
  `,
  model: anthropic("claude-sonnet-4-20250514"),
  // model: anthropic("claude-3-7-sonnet-20250219"),
  // model: vercel("v0-1.5-md"),
  tools: {
    readFile: fileTools.readFileTool,
    writeFile: fileTools.writeFileTool,
    listFilesInDirectory: fileTools.listFilesInDirectoryTool,
    deleteFile: fileTools.deleteFileTool,
    moveFile: fileTools.moveFileTool,
    readMultipleFilesInParallel: fileTools.readMultipleFilesInParallelTool,
    reportDone: createTool({
      id: "reportDone",
      description:
        "You use this tool to report to the architect that you are done. You should only use this tool if you are done with the task. This will be your last tool call.",
      inputSchema: z.object({
        summary: z
          .string()
          .describe(
            "Keep it concise, 3-4 sentences max. No code blocks or headings in the markdown. MUST be in first person e.g. 'I have ...'"
          ),
      }),
      execute: async ({ summary }) => {
        console.log("[reportDone] Summary recorded", summary);
        return "Thanks for your summary!";
      },
    }),
  },
  defaultStreamOptions: ({ runtimeContext }: { runtimeContext: RuntimeContextType }) => {
    const abortSignal = runtimeContext.get("signal");
    return {
      temperature: 0,
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
      
    };
  },
});
