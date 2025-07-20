import { daytona } from "@/lib/daytona-client";
import { getArtifactSandbox } from "@/lib/daytona-utils";
import { convertDBMessagesToImagineUIMessages, getOrCreateConversation } from "@/lib/message-history";
import { prisma } from "@/lib/prisma";
import { ImagineUIMessage } from "@/shared-types";
import { Context } from "hono";

export type GetConversationResult = {
  id: string;
  title: string;
  messages: ImagineUIMessage[];
  createdAt: Date;
  updatedAt: Date;
  artifactId: string;
  previewUrl: string | null;
}

export type GetConversationsResult = Omit<GetConversationResult, "messages" | "previewUrl"> & {};

export const getConversation = async (c: Context) => {
  const { conversationId } = c.req.param();
  const token = c.req.header("X-Imagine-Token");
  let previewUrl: string | null = null;
  
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversation = await getOrCreateConversation({
    conversationId,
    artifactId: conversationId,
  });

  // Check if sandbox is running
  const sandbox = await getArtifactSandbox({ artifactId: conversationId });

  if (sandbox) {
    const previewLinkResult = await sandbox.getPreviewLink(3000);
    previewUrl = previewLinkResult.url;
  }

  const messages = convertDBMessagesToImagineUIMessages(conversation.messages)
  
  const result: GetConversationResult = {
    id: conversation.id,
    title: conversation.title,
    messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    artifactId: conversationId,
    previewUrl,
  }
  return c.json(result);
}

export const getConversations = async (c: Context) => {
  const artifactId = c.req.param("artifactId");

  if (!artifactId) {
    return c.json({ error: "artifactId is required" }, 400);
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      artifactId,
    },
  });

  const result: GetConversationsResult[] = conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    artifactId,
  }));

  return c.json(result);
}