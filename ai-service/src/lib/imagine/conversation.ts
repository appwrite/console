import { InputJsonValue } from "@/lib/generated/prisma/runtime/library";
import { prisma } from "@/lib/prisma";
import { UIMessage } from "ai";
import { Conversation } from "@/lib/generated/prisma";

type SanitizedConversation = Omit<Conversation, "createdAt" | "updatedAt" | "uiMessages"> & {
  uiMessages: UIMessage[];
};

export async function getOrCreateConversation({
  conversationId,
  artifactId,
  projectId,
}: {
  conversationId: string;
  artifactId: string;
  projectId: string;
}): Promise<{
  conversation: SanitizedConversation;
  isNewConversation: boolean;
}> {
  const existingConversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });

  if (!existingConversation) {
    const newConversation: SanitizedConversation = {
      id: conversationId,
      artifactId,
      projectId,
      title: "New Conversation",
      uiMessages: [],
      modelMessages: [],
    };
    return {
      conversation: newConversation,
      isNewConversation: true,
    };
  }

  return {
    conversation: existingConversation as unknown as SanitizedConversation,
    isNewConversation: false,
  };
}

export async function updateConversation({
  conversation,
  artifactId,
  projectId,
}: {
  conversation: SanitizedConversation;
  artifactId: string;
  projectId: string;
}) {
  const { id: conversationId, uiMessages, ...rest } = conversation;

  console.log("Updating conversation history", { conversationId });
  await prisma.conversation.upsert({
    where: {
      id: conversationId,
    },
    update: {
      uiMessages: uiMessages as unknown as InputJsonValue,
    },
    create: {
      id: conversationId,
      artifactId,
      projectId,
      title: "New Conversation",
      uiMessages: uiMessages as unknown as InputJsonValue,
      modelMessages: [] as unknown as InputJsonValue,
    },
  }); 
  console.log("Conversation history updated");
}