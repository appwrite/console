import { SystemModelMessage } from "ai";
import { SystemPromptPart } from "./system-prompt-parts";
import { AnthropicExtendedProviderOptions, RepositoryFile } from "../../types";

export const getPagesAndComponents = (existingFiles: RepositoryFile[]) => {
  const ignoredPaths = ["src/components/ui", "dist"];

  const ignoredExtensions = [".css", ".scss"];

  const ignoredFiles = [
    "entities/User.json",
    "components.json",
    "eslint.config.js",
    "src/main.tsx",
    "src/lib/superdev.client.ts",
    "src/vite-env.d.ts",
    "src/index.html",
    "package-lock.json",
    "package.json",
    "bun.lock",
    "src/hooks/use-mobile.tsx",
    "src/hooks/use-toast.tsx",
    "postcss.config.js",
    "tailwind.config.ts",
    "tsconfig.app.json",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts",
  ];

  const pagesAndComponents = existingFiles.filter((f) => {
    if (ignoredPaths.some((path) => f.path.includes(path))) {
      return false;
    }

    if (ignoredExtensions.some((ext) => f.path.endsWith(ext))) {
      return false;
    }

    if (ignoredFiles.includes(f.path)) {
      return false;
    }

    return true;
  });

  return pagesAndComponents;
};

export const systemPromptPartsArrayToModelMessages = (systemPromptParts: Array<SystemPromptPart | undefined>): SystemModelMessage[] => {
  return systemPromptParts.filter(Boolean).map((part, i) => {
    const message: SystemModelMessage = {
      role: "system",
      content: part?.content || "",
      providerOptions: i === systemPromptParts.length - 1 ? {
        anthropic: {
          cacheControl: {
            type: "ephemeral",
            ttl: "5m",
          },
        } satisfies AnthropicExtendedProviderOptions,
      } : undefined,
    }

    return message;
  });
};