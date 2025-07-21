import { Context } from 'hono';
import { chatRequestBodySchema, ChatRequestBodyType } from './types';
import { z } from 'zod';
import {
    convertToModelMessages,
    createIdGenerator,
    createUIMessageStream,
    createUIMessageStreamResponse,
    generateId,
    hasToolCall,
    smoothStream,
    streamObject,
    streamText,
    TextPart,
    tool
} from 'ai';
import { createRuntimeContext, WriterType } from '../lib/ai/mastra/utils/runtime-context';
import { createImagineClient } from '@/lib/imagine/create-artifact-client';
import { anthropic } from '@ai-sdk/anthropic';
import { getOrCreateArtifactSandbox, startDevServer } from '@/lib/daytona/daytona-sandbox';
import { OnStepUpdateFn, workspaceStepSchema } from '@/lib/ai/custom-parts/workspace-state';
import { getOrCreateConversation, updateConversationHistory } from './message-history';
import { imagineToMastraToolset } from '@/lib/ai/mastra/tools/imagine-tool';
import { fileTools } from '@/lib/ai/mastra/tools/file-tools';
import { createSystemPrompt } from '@/lib/ai/system-prompt/create-system-prompt';
import { GitRepositoryUtils } from '@/lib/git-utils';
import {
    getPagesAndComponents,
    systemPromptPartsArrayToModelMessages
} from '@/lib/ai/system-prompt/system-prompt-utils';
import { currentCode } from '@/lib/ai/system-prompt/system-prompt-parts';
import * as systemPromptParts from '@/lib/ai/system-prompt/system-prompt-parts';
import dedent from 'dedent';
import { updateDependencies } from '@/lib/ai/dependency-manager';

export const routeHandler = async (c: Context) => {
    try {
        return handleChatRequest(c);
    } catch (e) {
        console.error('Error', e);
    }
};

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

    const convo = await getOrCreateConversation({
        conversationId,
        artifactId: conversationId
    });

    if (!convo) {
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
            const steps: z.infer<typeof workspaceStepSchema>[] = [];
            const messageId = generateId();

            writer.write({
                type: 'start',
                messageId,
            })

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

                if (steps.length > 0) {
                    writer.write({
                        type: 'data-workspace-state',
                        data: {
                            state: 'in-progress',
                            steps,
                            workspaceUrl: null
                        }
                    });
                }
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

            c.set('runtimeContext', runtimeContext);

            const synapse = runtimeContext.get('synapseClient');
            writer.write({
                type: 'data-workspace-state',
                data: {
                    state: 'completed',
                    steps,
                    workspaceUrl
                }
            });


            /** SYSTEM PROMPT */

            const gitRepositoryUtils = new GitRepositoryUtils(
                artifactId,
                runtimeContext.get('synapseClient')
            );
            const existingFiles = await gitRepositoryUtils.listRepositoryFileStrucrture();
            const relevantFiles = getPagesAndComponents(existingFiles);
            const readonlyFiles = [
                ...existingFiles.filter((f) => !relevantFiles.map((f) => f.path).includes(f.path)),
                {
                    path: 'index.html',
                    content: ''
                }
            ];

            const packageJson = JSON.parse(
                existingFiles.find((f) => f.path.includes('package.json'))?.content || '{}'
            );

            const currentCodeContext = currentCode({
                relevantFiles: existingFiles,
                readonlyFiles,
                packageJson
            });

            /** */

            const thinkingStartTime = Date.now();
            const thinkingId = createIdGenerator({ size: 10 })();
            let thoughts = '';

            const planResult = streamText({
                maxRetries: 3,
                model: anthropic('claude-sonnet-4-20250514'),
                abortSignal: signal,
                tools: {
                    readFile: fileTools.readFileTool,
                    listFilesInDirectory: fileTools.listFilesInDirectoryTool,
                    readMultipleFilesInParallel: fileTools.readMultipleFilesInParallelTool,
                    reportPlan: tool({
                        name: 'reportPlan',
                        description: 'You use this tool to report your final plan for implementation.',
                        inputSchema: z.object({
                            plan: z.string().describe('A detailed plan for implementation. Must be a few paragraphs long.'),
                        }),
                        execute: async ({ plan }) => {
                            console.log('reportPlan', plan);
                            return 'Your plan has been reported.';
                        }
                    })
                },
                stopWhen: hasToolCall('reportPlan'),
                activeTools: ["readFile", "listFilesInDirectory", "readMultipleFilesInParallel", "reportPlan"],
                messages: [
                    {
                        role: 'system',
                        content: dedent(`
                            You are an elite software architect.

                            Here is the current file layout and dependencies in the project:
                            ${currentCodeContext.content}


                            Please plan the steps to implement the user's request. You do not write any code.
                            You may read files to understand the contents of files, which will help you make a better plan.
                            Your plans should be concise and to the point.

                            You will produce the following outputs:
                            - A short and concise plan
                            - Whether a UI developer is needed

                            # Outputs

                            ## Plan
                            A short and concise plan of what exactly needs to be done to achieve the product manager's request. This should be 3-4 sentences maximum and in first person. E.g. 'I will ... and then ... '

                            ## When is a UI developer needed?
                            This is important because the UI developer will be the one to implement the design.

                            Examples of when a UI developer IS needed:
                            - Create new screens
                            - Modify existing screens with explicit design requests (e.g. adding elements or restructuring the layout)

                            Examples of when a UI developer IS NOT needed:
                            - Adding a React hook
                            - Adding an endpoint
                            - Pure logic changes
                            - Moving files around, renaming files, etc.

                            In termso f filesystem tool usage:
                            - You ONLY have access to read-only filesystem tools
                        `)
                    },
                    ...restMessages.map((m: any) => ({
                        role: m.role,
                        content: m.content
                    })),
                    {
                        role: 'user',
                        content: `
                
                Here is the product manager's request:
                <request>
                ${latestMessageTextPart.text}
                </request>
                      `
                    }
                ],
                headers: {
                    'anthropic-beta': [
                        'token-efficient-tools-2025-02-19',
                        'fine-grained-tool-streaming-2025-05-14',
                        'extended-cache-ttl-2025-04-11'
                    ].join(',')
                },
                experimental_transform: smoothStream({
                    delayInMs: 30,
                    chunking: 'word'
                }),
                onChunk: (event) => {
                    if (event.chunk.type === 'text') {
                        thoughts += event.chunk.text;

                        writer.write({
                            type: 'data-thinking',
                            id: thinkingId,
                            data: {
                                text: thoughts,
                                durationMs: null,
                                state: 'streaming'
                            }
                        });
                    }
                },
                onFinish: () => {
                    const thinkingEndTime = Date.now();
                    const thinkingDuration = thinkingEndTime - thinkingStartTime;
                    writer.write({
                        type: 'data-thinking',
                        id: thinkingId,
                        data: {
                            text: thoughts,
                            durationMs: thinkingDuration,
                            state: 'done'
                        }
                    });
                }
            });

            for await (const chunk of planResult.textStream) { }

            const planToolCall = (await planResult.toolCalls).find((call) => call.toolName === "reportPlan");

            if (!planToolCall) {
                writer.write({
                    type: "finish",
                })
                return;
            }

            const plan = planToolCall.input.plan;

            console.log('plan', plan);

            const implementResult = streamText({
                maxOutputTokens: 52000,
                maxRetries: 5,
                model: anthropic('claude-sonnet-4-20250514'),
                stopWhen: hasToolCall('reportDone'),
                tools: {
                    readFile: fileTools.readFileTool,
                    writeFile: fileTools.writeFileTool,
                    listFilesInDirectory: fileTools.listFilesInDirectoryTool,
                    deleteFile: fileTools.deleteFileTool,
                    moveFile: fileTools.moveFileTool,
                    readMultipleFilesInParallel: fileTools.readMultipleFilesInParallelTool,
                    reportDone: tool({
                        name: 'reportDone',
                        description:
                            'You use this tool to report to the architect that you are done. You should only use this tool if you are done with the task. This will be your last tool call.',
                        inputSchema: z.object({
                            summary: z
                                .string()
                                .describe(
                                    "Keep it concise, 3-4 sentences max. No code blocks or headings in the markdown. MUST be in first person e.g. 'I have ...'"
                                )
                        }),
                        execute: async ({ summary }) => {
                            console.log('[reportDone] Summary recorded', summary);
                            return 'Thanks for your summary!';
                        }
                    })
                },
                abortSignal: signal,
                messages: [
                    ...systemPromptPartsArrayToModelMessages([
                        systemPromptParts.highLevelInstructions(),
                        currentCodeContext,
                        isNewConversation
                            ? systemPromptParts.firstMessageInConversationInstructions()
                            : undefined,
                        systemPromptParts.instructionsReminder()
                    ]),
                    ...restMessages,
                    {
                        role: 'user',
                        content: dedent`
                            Here is the latest product manager request:
                            <product-manager-request>
                            ${latestMessageTextPart.text}
                            </product-manager-request>
                            
                            Here is the plan from the architect on how to implement it:
                            <architect-plan>
                            ${plan}
                            </architect-plan>
                        `
                    }
                ],
                headers: {
                    'anthropic-beta': [
                        'token-efficient-tools-2025-02-19',
                        'fine-grained-tool-streaming-2025-05-14',
                        'extended-cache-ttl-2025-04-11'
                    ].join(',')
                },
                experimental_transform: smoothStream({
                    delayInMs: 30,
                    chunking: 'word'
                }),
                onStepFinish: async (event) => {
                    console.log('[implementResult onStepFinish] onStepFinish');
                
                    const changedFiles = runtimeContext.get('changedFiles');
                    console.log('[implementResult onStepFinish] changedFiles', changedFiles);

                    const filesWithContents = await Promise.all(
                        changedFiles.map(async (f) => {
                            const content = await synapse.readFile({
                                path: f.path
                            });

                            return {
                                path: f.path,
                                content: content.content
                            }
                        })
                    )

                    await updateDependencies(
                        filesWithContents
                    )
                }
            });

            writer.merge(implementResult.toUIMessageStream({
                originalMessages: messages,
                sendStart: false,
            }));
        },
        onFinish: async (event) => {
            console.log('onFinish', { didError });
            if (didError) {
                return;
            }

            const { messages } = event;

            // The last message should NEVER be by the user. If that's the case, remove it.
            const lastMessage = messages[messages.length - 1];

            if (lastMessage.role === 'user') {
                console.log('Last message is user message, not saving');
            } else {
                console.log('Saving messages');

                await updateConversationHistory({
                    conversationId,
                    messages
                });

                console.log('Messages saved to imagine');
            }
        },
        onError: (error) => {
            didError = true;
            console.error('onError', error);
            return (error as Error).message ?? 'An error occurred';
        }
    });

    return createUIMessageStreamResponse({
        stream,
    });
};
