import { tool } from "ai";
import { z } from "zod";
import { createSynapseClient } from "../../synapse-http-client";

const readFileTool = tool({
  name: "readFile",
  description: "Read a file from the repository",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to read"),
  }),
  outputSchema: z.object({
    path: z.string().describe("The path to the file"),
    content: z.string().describe("The content of the file"),
  }),
  execute: async ({ path }) => {
    console.log(`[TOOL - readFile] Reading file at path: ${path}`);
    const synapse = createSynapseClient();
    const result = await synapse.readFile({ path });

    return {
      path: result.path,
      content: result.content,
    };
  },
});

const writeFilesTool = tool({
  name: "writeFiles",
  description: "Write multiple files to the repository",
  inputSchema: z.object({
    files: z.array(z.object({
      path: z.string().describe("The path to the file to write"),
      content: z.string().describe("The content of the file to write"),
    })),
  }),
  outputSchema: z.object({
    successFiles: z.array(z.object({ path: z.string().describe("The path to the file") })),
    errorFiles: z.array(z.object({ path: z.string().describe("The path to the file"), error: z.string().describe("The error message") })),
  }),
  execute: async ({ files }) => {
    const { successFiles, errorFiles } = await writeFiles(files);

    return {
      successFiles,
      errorFiles,
    };
  },
});

const writeFileTool = tool({
  name: "writeFile",
  description: "Write a single file to the repository. If the file does not exist, it will be created. If the file exists, it will be overwritten. You must provide the full file contents.",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to write"),
    content: z.string().describe("The content of the file to write"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the file was written successfully"),
    error: z.string().optional().describe("The error message if the file was not written successfully"),
  }),
  execute: async ({ path, content }) => {
    const { errorFiles } = await writeFiles([{ path, content }]);

    if (errorFiles.length > 0) {
      return {
        success: false,
        error: errorFiles[0].error,
      };
    } else {
      return {
        success: true,
      };
    }
  },
});

async function writeFiles(files: { path: string, content: string }[]) {
  const synapse = createSynapseClient();

  const successFiles: { path: string }[] = [];
  const errorFiles: { path: string, error: string }[] = [];
  
  for (const file of files) {
    try {
      await synapse.createOrUpdateFile({ filepath: file.path, content: file.content });
      successFiles.push({ path: file.path });
    } catch (error) {
      errorFiles.push({ path: file.path, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  return {
    successFiles,
    errorFiles,
  };
}

const listFilesInDirectoryTool = tool({
  name: "listFilesInDirectory",
  description: "List all files in a directory",
  inputSchema: z.object({
    path: z.string().default("/").describe("The path to the directory to list files from"),
    recursive: z.boolean().default(false).describe("Whether to list files recursively (dig into subdirectories)"),
  }),
  outputSchema: z.object({
    files: z.array(z.object({
      path: z.string().describe("The path to the file"),
    })),
  }),
  execute: async ({ path, recursive }) => {
    console.log(`[TOOL - listFilesInDirectory] Listing files in directory at path: ${path}, recursive: ${recursive}`);
    const synapse = createSynapseClient();
    const files = await synapse.listFilesInDir({
      dirPath: path || "/",
      recursive: recursive || false,
      withContent: false,
      additionalIgnorePatterns: [],
    })

    console.log(`[TOOL - listFilesInDirectory] Found ${files.length} files in directory at path: ${path}`);

    return {
      files,
    };
  },
});

const deleteFileTool = tool({
  name: "deleteFile",
  description: "Delete a file from the repository",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to delete"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the file was deleted successfully"),
  }),
  execute: async ({ path }) => {
    const synapse = createSynapseClient();
    await synapse.deleteFile({ filepath: path });

    return {
      success: true,
    };
  },
});

const moveFileTool = tool({
  name: "moveFile",
  description: "Move a file from one path to another. Also useful when renaming. If the directory does not exist, it will be created.",
  inputSchema: z.object({
    path: z.string().describe("The path to the file to move"),
    newPath: z.string().describe("The new path to the file"),
    intent: z.enum(["move", "rename"]).describe("The intent of the move operation. This will help render the appropriate UI to the user."),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the file was moved successfully"),
  }),
  execute: async ({ path, newPath }) => {
    const synapse = createSynapseClient();
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
};
