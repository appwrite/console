import { createImagineClient } from "@/lib/imagine/create-artifact-client";
import { Conversation } from "@/lib/imagine/imagine-api-client";
import { Context } from "hono";

const mapConversation = (conversation: Conversation) => {
  return {
    id: conversation.$id,
    name: conversation.name,
    messages: conversation.messages,
  };
};

export const getConversation = async (c: Context) => {
  const { conversationId } = c.req.param();
  const token = c.req.header("X-Imagine-Token");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const projectId = process.env.IMAGINE_PROJECT_ID!;
  const artifactId = process.env.IMAGINE_ARTIFACT_ID!;

  const { imagineClient } = await createImagineClient({
    projectId,
    token
  });

  const conversation = await imagineClient.getConversation(artifactId, conversationId);
  console.log("conversation", conversation);
  return c.json(mapConversation(conversation));
}

export const getConversations = async (c: Context) => {
  console.log("getConversations");
  const projectId = process.env.IMAGINE_PROJECT_ID!;
  const artifactId = process.env.IMAGINE_ARTIFACT_ID!;
  const token = c.req.header("X-Imagine-Token");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { imagineClient } = await createImagineClient({
    projectId,
    token
  });

  const conversations = await imagineClient.listConversations(artifactId);
  console.log("conversations", conversations);
  return c.json(conversations.conversations.map(mapConversation));
}