import { createTool } from "@mastra/core";
import { z } from "zod";
import { createSynapseClient, SynapseHTTPClient } from "@/lib/synapse-http-client";
import { createIdGenerator } from "ai";
import { getWriterFromContext, RuntimeContextType } from "../utils/runtime-context";

const readMultipleFilesInParallelTool = createTool({
  id: "readMultipleFilesInParallel",
  description: "Read multiple files from the repository. This is always encouraged over a single readFile if you know you need to read multiple files.",
  inputSchema: z.object({
    paths: z.array(z.string()).describe("The paths to the files to read"),
  }),
  outputSchema: z.object({
    files: z.array(z.object({
      path: z.string().describe("The path to the file"),
      content: z.string().describe("The content of the file"),
    })),
  }),
  execute: async (params) => {
    const { context: { paths } } = params;
    const runtimeContext = params.runtimeContext as RuntimeContextType;
    console.log(`[TOOL - readMultipleFilesInParallel]`, { paths });

    const files = await Promise.all(paths.map(async (path) => {
      const result = await readFileTool.execute({
        context: { path },
        runtimeContext,
      });
      return result;
    }));

    return { files };
  }
})

const readFileTool = createTool({
  id: "readFile",
  description: "Read a file from the repository",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to read"),
  }),
  outputSchema: z.object({
    path: z.string().describe("The path to the file"),
    content: z.string().describe("The content of the file"),
  }),
  execute: async (params) => {
    const {
      context: { path },
    } = params;
    console.log("[tool - readFile] params", params.context);
    const runtimeContext = params.runtimeContext as RuntimeContextType;
    const skipWritingToolCalls = runtimeContext.get("skipWritingToolCalls");
    const writer = getWriterFromContext(runtimeContext);
    const toolCallId = createIdGenerator({ size: 10 })();

    if (!skipWritingToolCalls) {
      writer.write({
        type: "tool-input-available",
        toolCallId,
        toolName: "readFile",
        input: {
          path,
        },
      });
    }
    const synapse = runtimeContext.get("synapseClient");
    const result = await synapse.readFile({ path });
    console.log(`[TOOL - readFile] Reading file at path: ${path}`);

    if (!skipWritingToolCalls) {
      writer.write({
        type: "tool-output-available",
        toolCallId,
        output: {
          success: true,
        },
      });
    }

    return {
      path: result.path,
      content: result.content,
    };
  },
});

const writeFilesTool = createTool({
  id: "writeFiles",
  description: "Write multiple files to the repository",
  inputSchema: z.object({
    files: z.array(
      z.object({
        path: z.string().describe("The path to the file to write"),
        content: z.string().describe("The content of the file to write"),
      })
    ),
  }),
  outputSchema: z.object({
    successFiles: z.array(
      z.object({ path: z.string().describe("The path to the file") })
    ),
    errorFiles: z.array(
      z.object({
        path: z.string().describe("The path to the file"),
        error: z.string().describe("The error message"),
      })
    ),
  }),
  execute: async (params) => {
    const { context: { files } } = params;
    const runtimeContext = params.runtimeContext as RuntimeContextType;
    const synapse = runtimeContext.get("synapseClient");

    const { successFiles, errorFiles } = await writeFiles(files, synapse);

    return {
      successFiles,
      errorFiles,
    };
  },
});

const writeFileTool = createTool({
  id: "writeFile",
  description:
    "Write a single file to the repository. If the file does not exist, it will be created. If the file exists, it will be overwritten. You must provide the full file contents.",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to write"),
    content: z.string().describe("The content of the file to write"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the file was written successfully"),
    error: z
      .string()
      .optional()
      .describe("The error message if the file was not written successfully"),
  }),
  execute: async (params) => {
    const {
      context: { path, content },
    } = params;
    const runtimeContext = params.runtimeContext as RuntimeContextType;
    const skipWritingToolCalls = runtimeContext.get("skipWritingToolCalls");
    const writer = getWriterFromContext(runtimeContext);
    const synapse = runtimeContext.get("synapseClient");

    const toolCallId = createIdGenerator({ size: 10 })();

    if (!skipWritingToolCalls) {
      writer.write({
        type: "tool-input-available",
        toolCallId,
        toolName: "writeFile",
        input: {
          path,
          content,
        },
      });
    }

    const { errorFiles } = await writeFiles([{ path, content }], synapse);

    if (errorFiles.length > 0) {
      return {
        success: false,
        error: errorFiles[0].error,
      };
    } else {
      if (!skipWritingToolCalls) {
        writer.write({
          type: "tool-output-available",
          toolCallId,
          output: {
            success: true,
          },
        });
      }
      return {
        success: true,
      };
    }
  },
});

async function writeFiles(files: { path: string; content: string }[], synapse: SynapseHTTPClient) {
  const successFiles: { path: string }[] = [];
  const errorFiles: { path: string; error: string }[] = [];

  for (const file of files) {
    try {
      await synapse.createOrUpdateFile({
        filepath: file.path,
        content: file.content,
      });
      successFiles.push({ path: file.path });
    } catch (error) {
      errorFiles.push({
        path: file.path,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    successFiles,
    errorFiles,
  };
}

const listFilesInDirectoryTool = createTool({
  id: "listFilesInDirectory",
  description: "List all files in a directory",
  inputSchema: z.object({
    path: z
      .string()
      .default("/")
      .describe("The path to the directory to list files from"),
    recursive: z
      .boolean()
      .default(false)
      .describe("Whether to list files recursively (dig into subdirectories)"),
  }),
  outputSchema: z.object({
    files: z.array(
      z.object({
        path: z.string().describe("The path to the file"),
      })
    ),
  }),
  execute: async (params) => {
    const { context: { path, recursive } } = params;
    const runtimeContext = params.runtimeContext as RuntimeContextType;
    const synapse = runtimeContext.get("synapseClient");
    console.log(
      `[TOOL - listFilesInDirectory] Listing files in directory at path: ${path}, recursive: ${recursive}`
    );
    const files = await synapse.listFilesInDir({
      dirPath: path || "/",
      recursive: recursive || false,
      withContent: false,
      additionalIgnorePatterns: [],
    });

    console.log(
      `[TOOL - listFilesInDirectory] Found ${files.length} files in directory at path: ${path}`
    );

    return {
      files,
    };
  },
});

const deleteFileTool = createTool({
  id: "deleteFile",
  description: "Delete a file from the repository",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to delete"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the file was deleted successfully"),
  }),
  execute: async (params) => {
    const { context: { path } } = params;
    const runtimeContext = params.runtimeContext as RuntimeContextType;
    const synapse = runtimeContext.get("synapseClient");
    await synapse.deleteFile({ filepath: path });

    return {
      success: true,
    };
  },
});

const moveFileTool = createTool({
  id: "moveFile",
  description:
    "Move a file from one path to another. Also useful when renaming. If the directory does not exist, it will be created.",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to move"),
    newPath: z.string().describe("The new path to the file"),
    intent: z
      .enum(["move", "rename"])
      .describe(
        "The intent of the move operation. This will help render the appropriate UI to the user."
      ),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the file was moved successfully"),
  }),
  execute: async (params) => {
    const { context: { path, newPath } } = params;
    const runtimeContext = params.runtimeContext as RuntimeContextType;
    const synapse = runtimeContext.get("synapseClient");
    await synapse.updateFilePath({ filepath: path, newPath });

    return {
      success: true,
    };
  },
});

export const fileTools = {
  readFileTool,
  // writeFilesTool,
  writeFileTool,
  listFilesInDirectoryTool,
  deleteFileTool,
  moveFileTool,
  readMultipleFilesInParallelTool,
};
