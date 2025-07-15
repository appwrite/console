import { StepResult } from "ai";

export class TokenCounter {
  private usage: {
    inputTokens: number;
    outputTokens: number;
    cachedInputTokens: number;
    cacheCreationInputTokens: number;
    reasoningTokens: number;
  } = {
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    cacheCreationInputTokens: 0,
    reasoningTokens: 0,
  };

  constructor() {
  }

  getUsage() {
    return this.usage;
  }

  recordUsage(event: StepResult<any>) {
    const { usage, providerMetadata } = event;
    this.usage.inputTokens += usage.inputTokens ?? 0;
    this.usage.outputTokens += usage.outputTokens ?? 0;
    this.usage.cachedInputTokens += usage.cachedInputTokens ?? 0;
    this.usage.reasoningTokens += usage.reasoningTokens ?? 0;
    this.usage.cacheCreationInputTokens += (providerMetadata?.anthropic as any)?.cacheCreationInputTokens ?? 0;
  }
}