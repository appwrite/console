import { IMAGINE_JWT } from "@/lib/constants";
import { createImagineClient } from "@/lib/imagine/create-artifact-client";
import { Conversation } from "@/lib/imagine/imagine-api-client";
import { Context } from "hono";

const mapConversation = (conversation: Conversation) => {
  return {
    id: conversation.$id,
    name: conversation.name,
    messages: conversation.messages.messages,
  };
};

export const getConversation = async (c: Context) => {
  console.log("getConversation");
  const { conversationId } = c.req.param();

  const projectId = process.env.IMAGINE_PROJECT_ID!;
  const artifactId = process.env.IMAGINE_ARTIFACT_ID!;

  const imagineClient = await createImagineClient({
    projectId,
    token: IMAGINE_JWT, // TODO: use the token from the request
  });

  const conversation = await imagineClient.getConversation(artifactId, conversationId);
  console.log("conversation", conversation);
  return c.json(mapConversation(conversation));
}

export const getConversations = async (c: Context) => {
  console.log("getConversations");
  const projectId = process.env.IMAGINE_PROJECT_ID!;
  const artifactId = process.env.IMAGINE_ARTIFACT_ID!;

  const imagineClient = await createImagineClient({
    projectId,
    token: IMAGINE_JWT, // TODO: use the token from the request
  });

  const conversations = await imagineClient.listConversations(artifactId);
  console.log("conversations", conversations);
  return c.json(conversations.conversations.map(mapConversation));
}