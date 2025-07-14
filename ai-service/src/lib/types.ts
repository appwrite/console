import { AnthropicProviderOptions } from "@ai-sdk/anthropic";
import z from "zod";

const fileSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export type RepositoryFile = z.infer<typeof fileSchema>;

export type NetworkRequest = {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  timestamp: string;
  duration?: number;
  responseBody?: string;
  requestBody?: string;
  headers?: Record<string, string>;
  error?: {
    message: string;
    stack?: string;
  };
}

export type ConsoleLog = {
  type: "CONSOLE_OUTPUT";
  level: string;
  message: string;
  logged_at: string;
  raw: string;
}

export type AnthropicExtendedProviderOptions = AnthropicProviderOptions & {
  cacheControl: {
    type: "ephemeral";
    ttl: "5m" | "1h";
  };
}