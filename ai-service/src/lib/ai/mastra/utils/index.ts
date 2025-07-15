import { AnthropicExtendedProviderOptions } from "@/lib/types";
import { SystemModelMessage } from "ai";

export const cacheSystemMessage = (message: SystemModelMessage) => {
  return {
    ...message,
    providerOptions: {
      ...message.providerOptions || {},
      cacheControl: {
        type: "ephemeral",
        ttl: "5m",
      },
    } satisfies AnthropicExtendedProviderOptions,
  };
}