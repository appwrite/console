import { z } from 'zod';
import { SynapseHTTPClient } from '@/lib/synapse-http-client';
import { createIdGenerator } from 'ai';
import { getWriterFromContext, HonoEnv } from '../utils/runtime-context';
import { createImagineTool } from './imagine-tool';
import { getContext } from 'hono/context-storage';

const readMultipleFilesInParallelTool = createImagineTool({
    id: 'readMultipleFilesInParallel',
    description:
        'Read multiple files from the repository. This is always encouraged over a single readFile if you know you need to read multiple files.',
    inputSchema: z.object({
        paths: z.array(z.string()).describe('The paths to the files to read')
    }),
    outputSchema: z.object({
        files: z.array(
            z.object({
                path: z.string().describe('The path to the file'),
                content: z.string().describe('The content of the file')
            })
        )
    }),
    execute: async ({ paths }) => {
        const runtimeContext = getContext<HonoEnv>().var.runtimeContext;
        const writer = getWriterFromContext(runtimeContext);
        
        writer.write({
          type: "start-step",
        })

        console.log(`[TOOL - readMultipleFilesInParallel]`, { paths });

        const files = await Promise.all(
            paths.map(async (path) => {
                const result = await readFileTool.execute({
                    path
                });
                return result;
            })
        );

        writer.write({
          type: "finish-step",
        })

        return { files };
    }
});

const readFileTool = createImagineTool({
    id: 'readFile',
    description: 'Read a file from the repository',
    inputSchema: z.object({
        path: z.string().describe('The path to the file to read')
    }),
    outputSchema: z.object({
        path: z.string().describe('The path to the file'),
        content: z.string().describe('The content of the file')
    }),
    execute: async ({ path }) => {
        const runtimeContext = getContext<HonoEnv>().var.runtimeContext;
        const skipWritingToolCalls = runtimeContext.get('skipWritingToolCalls');
        const writer = getWriterFromContext(runtimeContext);
        const toolCallId = createIdGenerator({ size: 10 })();

        writer.write({
          type: "start-step",
        })

        if (!skipWritingToolCalls) {
            writer.write({
                type: 'tool-input-available',
                toolCallId,
                toolName: 'readFile',
                input: {
                    path
                }
            });
        }
        const synapse = runtimeContext.get('synapseClient');
        const result = await synapse.readFile({ path });
        console.log(`[TOOL - readFile] Reading file at path: ${path}`);

        if (!skipWritingToolCalls) {
            writer.write({
                type: 'tool-output-available',
                toolCallId,
                output: {
                  path: result.path,
                  content: result.content
                }
            });
        }

        writer.write({
          type: "finish-step",
        })

        return {
            path: result.path,
            content: result.content
        };
    }
});

const writeFilesTool = createImagineTool({
    id: 'writeFiles',
    description: 'Write multiple files to the repository',
    inputSchema: z.object({
        files: z.array(
            z.object({
                path: z.string().describe('The path to the file to write'),
                content: z.string().describe('The content of the file to write')
            })
        )
    }),
    outputSchema: z.object({
        successFiles: z.array(z.object({ path: z.string().describe('The path to the file') })),
        errorFiles: z.array(
            z.object({
                path: z.string().describe('The path to the file'),
                error: z.string().describe('The error message')
            })
        )
    }),
    execute: async ({ files }) => {
        const runtimeContext = getContext<HonoEnv>().var.runtimeContext;
        const writer = getWriterFromContext(runtimeContext);
        const synapse = runtimeContext.get('synapseClient');

        writer.write({
          type: "start-step",
        })

        const { successFiles, errorFiles } = await writeFiles(files, synapse);

        writer.write({
          type: "finish-step",
        })

        return {
            successFiles,
            errorFiles
        };
    }
});

const writeFileTool = createImagineTool({
    id: 'writeFile',
    description:
        'Write a single file to the repository. If the file does not exist, it will be created. If the file exists, it will be overwritten. You must provide the full file contents.',
    inputSchema: z.object({
        path: z.string().describe('The path to the file to write'),
        content: z.string().describe('The content of the file to write')
    }),
    outputSchema: z.object({
        success: z.boolean().describe('Whether the file was written successfully'),
        error: z
            .string()
            .optional()
            .describe('The error message if the file was not written successfully')
    }),
    execute: async ({ path, content }) => {
        const runtimeContext = getContext<HonoEnv>().var.runtimeContext;
        const skipWritingToolCalls = runtimeContext.get('skipWritingToolCalls');
        const writer = getWriterFromContext(runtimeContext);
        const synapse = runtimeContext.get('synapseClient');

        writer.write({
          type: "start-step",
        })

        const toolCallId = createIdGenerator({ size: 10 })();

        if (!skipWritingToolCalls) {
            writer.write({
                type: 'tool-input-available',
                toolCallId,
                toolName: 'writeFile',
                input: {
                    path,
                    content
                }
            });
        }

        const { errorFiles } = await writeFiles([{ path, content }], synapse);

        if (errorFiles.length > 0) {
            writer.write({
              type: "finish-step",
            })
            return {
                success: false,
                error: errorFiles[0].error
            };
        } else {
            if (!skipWritingToolCalls) {
                writer.write({
                    type: 'tool-output-available',
                    toolCallId,
                    output: {
                        success: true
                    }
                });
            }
            writer.write({
              type: "finish-step",
            })
            return {
                success: true
            };
        }
    }
});

async function writeFiles(files: { path: string; content: string }[], synapse: SynapseHTTPClient) {
    const successFiles: { path: string }[] = [];
    const errorFiles: { path: string; error: string }[] = [];

    for (const file of files) {
        try {
            await synapse.createOrUpdateFile({
                filepath: file.path,
                content: file.content
            });
            successFiles.push({ path: file.path });
        } catch (error) {
            errorFiles.push({
                path: file.path,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    return {
        successFiles,
        errorFiles
    };
}

const listFilesInDirectoryTool = createImagineTool({
    id: 'listFilesInDirectory',
    description: 'List all files in a directory',
    inputSchema: z.object({
        path: z.string().default('/').describe('The path to the directory to list files from'),
        recursive: z
            .boolean()
            .default(false)
            .describe('Whether to list files recursively (dig into subdirectories)')
    }),
    outputSchema: z.object({
        files: z.array(
            z.object({
                path: z.string().describe('The path to the file')
            })
        )
    }),
    execute: async ({ path, recursive }) => {
        const runtimeContext = getContext<HonoEnv>().var.runtimeContext;
        const writer = getWriterFromContext(runtimeContext);
        const synapse = runtimeContext.get('synapseClient');

        writer.write({
          type: "start-step",
        })

        console.log(
            `[TOOL - listFilesInDirectory] Listing files in directory at path: ${path}, recursive: ${recursive}`
        );
        const files = await synapse.listFilesInDir({
            dirPath: path || '/',
            recursive: recursive || false,
            withContent: false,
            additionalIgnorePatterns: []
        });

        console.log(
            `[TOOL - listFilesInDirectory] Found ${files.length} files in directory at path: ${path}`
        );

        writer.write({
          type: "finish-step",
        })

        return {
            files
        };
    }
});

const deleteFileTool = createImagineTool({
    id: 'deleteFile',
    description: 'Delete a file from the repository',
    inputSchema: z.object({
        path: z.string().describe('The path to the file to delete')
    }),
    outputSchema: z.object({
        success: z.boolean().describe('Whether the file was deleted successfully')
    }),
    execute: async ({ path }) => {
        const runtimeContext = getContext<HonoEnv>().var.runtimeContext;
        const writer = getWriterFromContext(runtimeContext);
        const synapse = runtimeContext.get('synapseClient');

        writer.write({
          type: "start-step",
        })

        await synapse.deleteFile({ filepath: path });

        writer.write({
          type: "finish-step",
        })

        return {
            success: true
        };
    }
});

const moveFileTool = createImagineTool({
    id: 'moveFile',
    description:
        'Move a file from one path to another. Also useful when renaming. If the directory does not exist, it will be created.',
    inputSchema: z.object({
        path: z.string().describe('The path to the file to move'),
        newPath: z.string().describe('The new path to the file'),
        intent: z
            .enum(['move', 'rename'])
            .describe(
                'The intent of the move operation. This will help render the appropriate UI to the user.'
            )
    }),
    outputSchema: z.object({
        success: z.boolean().describe('Whether the file was moved successfully')
    }),
    execute: async ({ path, newPath }) => {
        const runtimeContext = getContext<HonoEnv>().var.runtimeContext;
        const writer = getWriterFromContext(runtimeContext);
        const synapse = runtimeContext.get('synapseClient');

        writer.write({
          type: "start-step",
        })

        await synapse.updateFilePath({ filepath: path, newPath });

        writer.write({
          type: "finish-step",
        })

        return {
            success: true
        };
    }
});

export const fileTools = {
    readFileTool,
    writeFileTool,
    listFilesInDirectoryTool,
    deleteFileTool,
    moveFileTool,
    readMultipleFilesInParallelTool
};