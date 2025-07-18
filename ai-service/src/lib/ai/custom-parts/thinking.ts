import { z } from "zod";

export const thinkingUIDataPartSchema = z.union([
  z.object({
    text: z.string(),
    durationMs: z.null(),
    state: z.enum(["streaming"]),
  }),
  z.object({
    text: z.string(),
    durationMs: z.number(),
    state: z.enum(["done"]),
  })
]);

export interface ThinkingUIDataPart {
  type: "thinking";
  id: string;
  data: z.infer<typeof thinkingUIDataPartSchema>;
}
