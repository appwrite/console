import { UIMessage } from "ai";
import { z } from "zod";

export const chatRequestBodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()).min(1),
  trigger: z.string(),
  id: z.string(),
  artifactId: z.string(),
  projectId: z.string(),
});

export type ChatRequestBodyType = z.infer<typeof chatRequestBodySchema>;