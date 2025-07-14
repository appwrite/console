import { getLastDiff } from "../../git-utils";
import * as systemPromptParts from "./system-prompt-parts";
import type { SystemPromptPart } from "./system-prompt-parts";
import {
  getPagesAndComponents,
  systemPromptPartsArrayToModelMessages,
} from "./system-prompt-utils";
import { SystemPromptPartId } from "./system-prompt-parts";
import { NetworkRequest, RepositoryFile } from "../../types";
import { ConsoleLog } from "../../types";
import { UserModelMessage } from "ai";
import { ANTHROPIC_MAX_CACHE_CONTROL_BLOCKS } from "../../constants";

export interface CreateSystemPromptParams {
  artifactId: string;
  projectId: string;
  projectCreated: boolean;
  existingFiles: RepositoryFile[];
  isFirstMessageInConversation: boolean;
  currentRoutePath: string;
  consoleLogs: ConsoleLog[];
  networkRequests: NetworkRequest[];
  latestUserMessage: UserModelMessage;
}

export const createSystemPrompt = ({
  artifactId,
  projectId,
  projectCreated,
  existingFiles,
  isFirstMessageInConversation,
  currentRoutePath,
  consoleLogs,
  networkRequests,
  latestUserMessage,
}: CreateSystemPromptParams) => {
  let lastCommit: Awaited<ReturnType<typeof getLastDiff>> | null = null;
  const systemMessages: SystemPromptPart[] = [
    systemPromptParts.highLevelInstructions(),
  ];

  // if (projectCreated) {
  //   console.time("getLastDiff");
  //   lastCommit = await getLastDiff("arielweinberger", `vibecode-playground`);
  //   console.timeEnd("getLastDiff");
  // }

  const relevantFiles = getPagesAndComponents(existingFiles);

  const readonlyFiles = [
    ...existingFiles
      .filter((f) => !relevantFiles.map((f) => f.path).includes(f.path)),
    {
      path: "index.html",
      content: "",
    },
  ];

  // console.log(
  //   "[createSystemPrompt] relevantFiles",
  //   relevantFiles.map((f) => f.path)
  // );

  const packageJson = JSON.parse(
    existingFiles.find((f) => f.path.includes("package.json"))?.content || "{}"
  );

  // console.log("[createSystemPrompt] packageJson", packageJson);

  if (isFirstMessageInConversation) {
    systemMessages.push(
      systemPromptParts.firstMessageInConversationInstructions()
    );
  }

  systemMessages.push(
    systemPromptParts.currentCode({
      relevantFiles,
      readonlyFiles,
      packageJson,
    })
  );

  systemMessages.push(
    systemPromptParts.useParallelToolCalls(),
    systemPromptParts.instructionsReminder(),
    systemPromptParts.runtimeContext({
      networkRequests,
      consoleLogs,
      currentRoutePath,
    }),
  );

  // Log usage of system prompt parts
  // console.log(
  //   "[createSystemPrompt] System prompt parts usage",
  //   Object.values(SystemPromptPartId).reduce((acc, id) => {
  //     acc[id] = systemMessages.some((m) => m.id === id);
  //     return acc;
  //   }, {} as Record<string, boolean>)
  // );

  // Sort mesages by cache, with the cache ones first
  systemMessages.sort((a, b) => {
    if (a.cache && !b.cache) return -1;
    if (!a.cache && b.cache) return 1;
    return 0;
  });

  // Make sure only the first 4 messages with cache:true retain that setting due to Anthropic's cache control limit
  const copy = [...systemMessages];
  let cacheCount = 0;
  copy.forEach((m) => {
    if (m.cache) {
      if (cacheCount >= ANTHROPIC_MAX_CACHE_CONTROL_BLOCKS) {
        m.cache = false;
      }
      cacheCount++;
    }
  });

  const modelSystemMessages = systemPromptPartsArrayToModelMessages(copy);
  return modelSystemMessages;
};