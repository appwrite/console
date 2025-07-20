import { checkpointUIDataPartSchema } from '@/lib/ai/custom-parts/checkpoint';
import { thinkingUIDataPartSchema } from '@/lib/ai/custom-parts/thinking';
import { workspaceStateUIDataPartSchema } from '@/lib/ai/custom-parts/workspace-state';
import { fileTools } from '@/lib/ai/mastra/tools/file-tools';
import { InferUIDataParts, InferUITool, ToolUIPart, UIMessage } from 'ai';
export type { GetConversationResult, GetConversationsResult } from '@/handlers/conversations.handler';

export type ImagineTools = {
    readFile: InferUITool<typeof fileTools.readFileTool>;
    writeFile: InferUITool<typeof fileTools.writeFileTool>;
    listFilesInDirectory: InferUITool<typeof fileTools.listFilesInDirectoryTool>;
    deleteFile: InferUITool<typeof fileTools.deleteFileTool>;
    moveFile: InferUITool<typeof fileTools.moveFileTool>;
};

export type ImagineUIToolParts = ToolUIPart<ImagineTools>;

export type ImagineUIDataParts = InferUIDataParts<{
    checkpoint: typeof checkpointUIDataPartSchema;
    thinking: typeof thinkingUIDataPartSchema;
    "workspace-state": typeof workspaceStateUIDataPartSchema;
}>;

export type ImagineUIMessage = UIMessage<never, ImagineUIDataParts, ImagineTools>;
