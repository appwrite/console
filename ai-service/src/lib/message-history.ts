import { ImagineUIMessage } from "@/shared-types";
import { Message, Prisma } from "./generated/prisma";
import { prisma } from "./prisma";

type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    messages: true;
  };
}>;

export function convertDBMessagesToImagineUIMessages(messages: Message[]): ImagineUIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role === "user" ? "user" : "assistant",
    parts: message.parts as any,
  }));
}

export async function getOrCreateConversation({
  conversationId,
  artifactId,
}: {
  conversationId: string;
  artifactId: string;
}): Promise<ConversationWithMessages> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      artifactId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      }
    }
  });

  if (!conversation) {
    return await prisma.conversation.create({
      data: {
        id: conversationId,
        artifactId,
        title: "New Conversation",
      },
      include: {
        messages: true,
      }
    });
  }

  return conversation;
}

export async function updateConversationHistory({
  conversationId,
  messages,
}: {
  conversationId: string;
  messages: ImagineUIMessage[];
}) {
  const convo = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
    },
    include: {
      messages: true,
    },
  });
  
  if (!convo) {
    throw new Error("Conversation not found");
  }

  const incomingMessageIds = messages.map(m => m.id);
  const existingMessages = convo.messages.filter(m => incomingMessageIds.includes(m.id));
  const existingMessageIds = new Set(existingMessages.map(m => m.id));

  const messagesToCreate = messages
    .filter(m => !existingMessageIds.has(m.id))
    .map((message) => ({
      id: message.id,
      role: message.role === "user" ? "user" as const : "assistant" as const,
      parts: message.parts,
      conversationId,
      createdAt: new Date(),
    }));

  const messagesToUpdate = messages
    .filter(m => existingMessageIds.has(m.id))
    .map((message) => ({
      id: message.id,
      role: message.role === "user" ? "user" as const : "assistant" as const,
      parts: message.parts,
    }));

  // Use bulk operations for much better performance
  await prisma.$transaction(async (tx) => {
    // Bulk create new messages
    if (messagesToCreate.length > 0) {
      await tx.message.createMany({
        data: messagesToCreate,
        skipDuplicates: true
      });
    }

    // Bulk update existing messages
    if (messagesToUpdate.length > 0) {
      await Promise.all(
        messagesToUpdate.map(message =>
          tx.message.update({
            where: { id: message.id },
            data: {
              role: message.role,
              parts: message.parts,
            }
          })
        )
      );
    }
  });
}