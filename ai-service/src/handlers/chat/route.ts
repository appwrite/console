import { Context } from 'hono';
import { chatRequestBodySchema, ChatRequestBodyType } from './types';
import { z } from 'zod';
import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    streamText,
    TextPart
} from 'ai';
import { createRuntimeContext, WriterType } from '../../lib/ai/mastra/utils/runtime-context';
import { mastra } from '../../lib/ai/mastra';
import { createImagineClient } from '@/lib/imagine/create-artifact-client';
import { anthropic } from '@ai-sdk/anthropic';
import { Workspace } from '@/lib/imagine/workspaces-api-client';
import { AppwriteException } from '@appwrite.io/console';
import { createSynapseClient } from '@/lib/synapse-http-client';
import { daytona } from '@/lib/daytona-client';
import { Sandbox } from '@daytonaio/sdk';
import { getOrCreateArtifactSandbox, startDevServer } from '@/lib/daytona-utils';
import { OnStepUpdateFn, WorkspaceStepId, workspaceStepSchema } from '@/lib/ai/custom-parts/workspace-state';

export const handleChatRequest = async (c: Context) => {
    c.res.headers.set('x-vercel-ai-ui-message-stream', 'v1');
    const signal = c.req.raw.signal;

    const token = c.req.header('X-Imagine-Token');

    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    let body: ChatRequestBodyType;

    /** Create workspace */

    // Parse request body
    try {
        const json = await c.req.json();
        body = chatRequestBodySchema.parse(json);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.issues }, 400);
        }

        console.error('Error', error);
        return c.json('An unknown error occurred', 500);
    }

    const { id: conversationId, messages, trigger, artifactId, projectId } = body;

    if (trigger === 'submit-tool-result') {
        // save to file
        // return c.body(null, 200);
        return streamText({
            model: anthropic('claude-3-7-sonnet-20250219'),
            messages: convertToModelMessages(messages)
        }).toUIMessageStreamResponse();
    }

    const { imagineClient, workspacesClient } = await createImagineClient({
        projectId,
        token // TODO: use the token from the request
    });

    const imagineConvo = await imagineClient.getConversation(artifactId, conversationId);

    if (!imagineConvo) {
        throw new Error('Conversation not found');
    }

    const convertedMessages = convertToModelMessages(messages);

    const latestMessage = convertedMessages[convertedMessages.length - 1];

    const latestMessageTextPart = latestMessage.content[0] as TextPart;
    const restMessages = convertedMessages.slice(0, -1);
    const isNewConversation = restMessages.length === 0;

    let didError = false;

    const stream = createUIMessageStream({
        originalMessages: messages,
        execute: async (params) => {
            const writer = params.writer as WriterType;

            writer.write({
                type: 'data-workspace-state',
                data: {
                    state: 'pending',
                    workspaceUrl: null,
                    steps: []
                },
                transient: true
            });

            const steps: z.infer<typeof workspaceStepSchema>[] = [];

            const updateStep: OnStepUpdateFn = ({
                id,
                status,
                text
                }: Parameters<OnStepUpdateFn>[0]) => {
                const found = steps.find((step) => step.id === id);

                if (found) {
                    found.status = status;
                    found.text = text;
                } else {
                    steps.push({ id, status, text });
                }

                writer.write({
                    type: "data-workspace-state",
                    data: {
                        state: "in-progress",
                        steps,
                        workspaceUrl: null
                    }
                })
            };

            const { sandbox } = await getOrCreateArtifactSandbox({
                artifactId,
                onStepUpdate: updateStep
            });

            const { previewUrl } = await startDevServer({
                sandbox,
                onStepUpdate: updateStep
            });

            const workspaceUrl = previewUrl;

            const runtimeContext = createRuntimeContext({
                writer,
                artifactId,
                restMessages,
                isFirstMessage: isNewConversation,
                signal,
                sandbox
            });

            console.log("Reporting compelted");

            writer.write({
                type: "data-workspace-state",
                data: {
                    state: "completed",
                    steps,
                    workspaceUrl
                }
            })

            c.set('runtimeContext', runtimeContext);
            const run = await mastra.getWorkflow('codeWorkflow').createRunAsync();

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

            // The last message should NEVER be by the user. If that's the case, remove it.
            const lastMessage = messages[messages.length - 1];

            console.log('lastMessage', JSON.stringify(lastMessage, null, 2));

            console.log('Saving messages to imagine');
            // await imagineClient.updateConversation(
            //     artifactId,
            //     imagineConvo.$id,
            //     'Test Conversation',
            //     messages
            // );
            console.log('Messages saved to imagine');
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
