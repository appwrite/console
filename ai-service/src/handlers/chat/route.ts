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
import { ARTIFACT_ID, PROJECT_ID } from '@/constants';

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

    const artifactId = ARTIFACT_ID;
    const projectId = PROJECT_ID;

    const { conversation, isNewConversation } = await getOrCreateConversation({
        conversationId,
        artifactId,
        projectId
    });

    const convertedMessages = convertToModelMessages(messages);
    const latestMessage = convertedMessages[convertedMessages.length - 1];

    const latestMessageTextPart = latestMessage.content[0] as TextPart;
    const restMessages = convertedMessages.slice(0, -1);

    let didError = false;

    const stream = createUIMessageStream({
        originalMessages: messages,
        execute: async (params) => {
            const writer = params.writer as WriterType;
            const runtimeContext = createRuntimeContext({ writer });
            const run = await mastra.getWorkflow('codeWorkflow').createRunAsync();
            runtimeContext.set('restMessages', restMessages || []);
            runtimeContext.set('isFirstMessage', isNewConversation);
            runtimeContext.set('signal', signal);

            const result = run.stream({
                inputData: {
                    userPrompt: latestMessageTextPart.text
                },
                runtimeContext
            });

            writer.write({
                type: 'start'
            });

            writer.write({
                type: 'start-step'
            });

            for await (const chunk of result.stream) {
                // We must await the stream
            }

            writer.write({
                type: 'finish-step'
            });

            writer.write({
                type: 'finish'
            });
        },
        onFinish: async (event) => {
            console.log('onFinish', { didError });
            if (didError) {
                return;
            }

            const { messages } = event;

            await updateConversation({
              conversation: {
                ...conversation,
                uiMessages: messages,
              },
              artifactId,
              projectId,
            });

            const savedModelmessages = convertToModelMessages(messages, {});
            console.log('savedModelmessages', JSON.stringify(savedModelmessages, null, 2));
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
