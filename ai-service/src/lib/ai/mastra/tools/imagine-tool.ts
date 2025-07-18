import { Tool as MastraTool, ToolExecutionContext } from '@mastra/core';
import z from 'zod';

export type ImagineTool<TInput extends z.ZodSchema, TOutput extends z.ZodSchema> = {
    id: string;
    description: string;
    inputSchema: TInput;
    outputSchema: TOutput;
    execute: (input: z.infer<TInput>) => Promise<z.infer<TOutput>> | z.infer<TOutput>;
};

export const createImagineTool = <TInput extends z.ZodSchema, TOutput extends z.ZodSchema>({
    id,
    description,
    inputSchema,
    outputSchema,
    execute
}: {
    id: string;
    description: string;
    inputSchema: TInput;
    outputSchema: TOutput;
    execute: (input: z.infer<TInput>) => Promise<z.infer<TOutput>> | z.infer<TOutput>;
}): ImagineTool<TInput, TOutput> => {
    return {
        id,
        description,
        inputSchema,
        outputSchema,
        execute
    };
};

export const mastraToImagineToolCallAdapter = <
    TInput extends z.ZodSchema,
    TOutput extends z.ZodSchema
>(
    tool: ImagineTool<TInput, TOutput>
): MastraTool<TInput, TOutput, ToolExecutionContext<TInput>> => {
    return {
        id: tool.id,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        __isMastraTool: true,
        execute: async (params: ToolExecutionContext<TInput>) => {
            return tool.execute(params.context);
        }
    };
};

export const imagineToMastraToolset = <
    T extends Record<string, ImagineTool<any, any>>
>(
    tools: T
): {
    [K in keyof T]: T[K] extends ImagineTool<infer TInput, infer TOutput>
        ? MastraTool<TInput, TOutput, ToolExecutionContext<TInput>>
        : never;
} => {
    return Object.fromEntries(
        Object.entries(tools).map(([key, tool]) => [key, mastraToImagineToolCallAdapter(tool)])
    ) as any;
};
