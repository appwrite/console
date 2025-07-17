import { Context } from 'hono';
import { chatRequestBodySchema, ChatRequestBodyType } from './types';
import { z } from 'zod';
import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    TextPart
} from 'ai';
import { createRuntimeContext, WriterType } from '../../lib/ai/mastra/utils/runtime-context';
import { mastra } from '../../lib/ai/mastra';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';
const exec = promisify(_exec);
import fs from 'fs';
import path from 'path';
import { createImagineClient } from '../../lib/imagine/create-artifact-client';

export const handleChatRequest = async (c: Context) => {
    const signal = c.req.raw.signal;
    
    const token = c.req.header('X-Imagine-Token');
    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    let body: ChatRequestBodyType;

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
        // Skip
        return c.body(null, 200);
    }

    const imagineClient = await createImagineClient({
        projectId,
        token // TODO: use the token from the request
    });
    const convos = await imagineClient.listConversations(artifactId);
    const imagineConvo = convos.conversations[0];
    const convertedMessages = convertToModelMessages(messages);
    const latestMessage = convertedMessages[convertedMessages.length - 1];
    
    const latestMessageTextPart = latestMessage.content[0] as TextPart;
    const restMessages = convertedMessages.slice(0, -1);
    
    // If it's a new conversation, we need to clone the workspace
    // This is temporary and will be handled by Synapse shortly!
    const isNewConversation = restMessages.length === 0;
    if (isNewConversation) {
        const workspaceDir = path.resolve(process.cwd(), `./tmp/workspace/artifact/${artifactId}`);
        console.log('workspaceDir', workspaceDir);
        const exists = fs.existsSync(workspaceDir);

        if (exists) {
            console.log('Workspace already exists, skipping clone');
        } else {
            console.log('Workspace does not exist, creating directory...');
            await exec(`mkdir -p ${workspaceDir}`);
            console.log("Cloning template 'base-vite-template'...");
            await exec(`pnpx degit appwrite/templates-for-frameworks/base-vite-template .`, {
                cwd: workspaceDir
            });
            console.log('Installing dependencies...');
            await exec(`bun install`, { cwd: workspaceDir });
        }
    } else {
        console.log('Not a new conversation, skipping workspace clone');
    }

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
