import { Context } from 'hono';
import { chatRequestBodySchema, ChatRequestBodyType } from './types';
import { z } from 'zod';
import { getOrCreateConversation, updateConversation } from '@/lib/imagine/conversation';
import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    TextPart
} from 'ai';
import { createRuntimeContext, WriterType } from '@/lib/ai/mastra/utils/runtime-context';
import { mastra } from '@/lib/ai/mastra';
import fs from 'fs';
import { createSynapseClient } from '@/lib/synapse-http-client';

export const handleChatRequest = async (c: Context) => {
    const signal = c.req.raw.signal;
    let body: ChatRequestBodyType;

    // Parse request body
    try {
        body = chatRequestBodySchema.parse(await c.req.json());
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.issues }, 400);
        }

        console.error('Error', error);
        return c.json('An unknown error occurred', 500);
    }

    const { id: conversationId, messages, trigger } = body;

    if (trigger === "submit-tool-result") {
      // Skip
      return c.body(null, 200);
    }

    const artifactId = process.env.IMAGINE_ARTIFACT_ID!; // TODO: dynamically from body
    const projectId = process.env.IMAGINE_PROJECT_ID!; // TODO: dynamically from body

    const { conversation, isNewConversation } = await getOrCreateConversation({
        conversationId,
        artifactId,
        projectId
    });

    const convertedMessages = convertToModelMessages(messages);
    const latestMessage = convertedMessages[convertedMessages.length - 1];

    const latestMessageTextPart = latestMessage.content[0] as TextPart;
    const restMessages = convertedMessages.slice(0, -1);

    const synapseClient = createSynapseClient({
      artifactId,
    });

    // Save to temp.json
    fs.writeFileSync("temp.json", JSON.stringify(messages, null, 2));

    let didError = false;

    const stream = createUIMessageStream({
        originalMessages: messages,
        execute: async (params) => {
            const writer = params.writer as WriterType;
            const runtimeContext = createRuntimeContext({ writer, artifactId, restMessages, isFirstMessage: isNewConversation, signal });
            const run = await mastra.getWorkflow('codeWorkflow').createRunAsync();

            const result = run.stream({
                inputData: {
                  userPrompt: latestMessageTextPart.text
                },
                runtimeContext
            });

            writer.write({
              type: 'start',
            });

            writer.write({
              type: 'start-step'
            });

            console.log("BEFORE STREAM");

            for await (const chunk of result.stream) {
                // We must await the stream
            }

            console.log("AFTER STREAM");

            writer.write({
                type: 'finish-step'
            });

            writer.write({
                type: 'finish',
            });
        },
        onFinish: async (event) => {
            console.log('onFinish', { didError });
            if (didError) {
                return;
            }

            const { messages } = event;

            console.log("Saving conversation", { conversationId });

            await updateConversation({
              conversation: {
                ...conversation,
                uiMessages: messages,
              },
              artifactId,
              projectId,
            });
        },
        onError: (error) => {
            didError = true;
            console.error('onError', error);
            return (error as Error).message ?? 'An error occurred';
        }
    });

    return createUIMessageStreamResponse({
        stream
    });
};
