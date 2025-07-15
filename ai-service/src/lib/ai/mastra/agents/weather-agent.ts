import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";

export const weatherAgent = new Agent({
  name: "Software Developer Agent",
  instructions: `
      You are a helpful software developer assistant that provides accurate weather information.
`,
  // model: anthropic('claude-3-7-sonnet-20250219'),
  model: google("gemini-2.5-pro"),
  tools: {
  }
});
