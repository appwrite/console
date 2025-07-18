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

export const handleChatRequest = async (c: Context) => {
    c.res.headers.set('x-vercel-ai-ui-message-stream', 'v1');
    const signal = c.req.raw.signal;

    const token = c.req.header('X-Imagine-Token');

    console.log('token', token);

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

    // Create workspace
    let workspace: Workspace;
    const workspaceUrl = `${process.env.WORKSPACE_URL_PROTOCOL}://${artifactId}.${process.env.WORKSPACE_URL_DOMAIN}:${process.env.WORKSPACE_URL_PORT}`;
    console.log('workspaceUrl', workspaceUrl);

    try {
        console.log('Getting workspace');
        workspace = await workspacesClient.get(artifactId);
        console.log('Found existing workspace', workspace);
    } catch (error) {
        if ((error as AppwriteException).type === 'workspace_not_found') {
            console.log('Workspace not found, creating...');
            workspace = await workspacesClient.create(artifactId, artifactId, "s-1vcpu-1gb");
            console.log('Created new workspace', workspace);
            console.log('Creating proxy rule');
            console.time("createWorkspaceProxyRule");
            const proxyRule = await workspacesClient.createWorkspaceProxyRule(
                `${artifactId}.functions.localhost`,
                workspace.$id
            );
            console.timeEnd("createWorkspaceProxyRule");
            console.log('Created proxy rule', proxyRule);
        } else {
            throw error;
        }
    }
    
    const synapseClient = createSynapseClient({
        artifactId
    });
    
    console.log("Creating artifact directory");
    await synapseClient.executeCommand({
        command: "mkdir -p artifact",
        cwd: "/usr/local"
    });
    
    console.log("Cloning template")
    await synapseClient.executeCommand({
        command: "bunx giget@latest gh:appwrite/templates-for-frameworks/base-vite-template .",
        cwd: "/usr/local/artifact",
        timeout: 60000,
    });

    console.log("Installing dependencies")
    await synapseClient.executeCommand({
        command: "bun install",
        cwd: "/usr/local/artifact",
        timeout: 60000,
    });

    console.log("Running bun dev in the background")
    await synapseClient.startBackgroundProcess({
        command: "bun",
        args: ["run", "dev"],
        cwd: "/usr/local/artifact", 
    });

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
            const runtimeContext = createRuntimeContext({
                writer,
                artifactId,
                restMessages,
                isFirstMessage: isNewConversation,
                signal
            });

            writer.write({
               type: "data-workspace-state",
               data: {
                state: "ready",
                workspaceUrl,
               },
               transient: true
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

            console.log('finalMessagesToSave', JSON.stringify(messages, null, 2));

            console.log('Saving messages to imagine');
            await imagineClient.updateConversation(
                artifactId,
                imagineConvo.$id,
                'Test Conversation',
                messages
            );
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
