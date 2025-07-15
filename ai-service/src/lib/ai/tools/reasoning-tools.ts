import z from "zod";
import { tool } from "ai";

export const describeThoughtTool = tool({
  name: "describeThought",
  description: "You use this tool to describe your thoughts in between steps, instead of outputting simple text.",
  inputSchema: z.object({
    thought: z.string().describe("The thought you want to describe. E.g. 'I will read all files in the repository to better understand the structure of the project.'"),
  }),
  execute: async ({ thought }) => {
    console.log("[thought] Thought recorded", thought);
    return "Thought recorded";
  },
})

export const respondToUser = tool({
  name: "summary",
  description: "You use this tool to summarize what you did to the user after you are done.",
  inputSchema: z.object({
    summary: z.string().describe("The summary of what you did to the user after you are done. This supports markdown format. Keep it concise, 3-4 sentences max. No code blocks in the markdown."),
  }),
  execute: async ({ summary }) => {
    console.log("[summary] Summary recorded", summary);
    return "Summary recorded";
  },
})

export const reasoningTools = {
  describeThoughtTool,
  respondToUser,
}