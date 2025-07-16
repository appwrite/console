import { z } from "zod";
import { ImagineUIMessage } from "@/shared-types";

export const chatRequestBodySchema = z.object({
  messages: z.array(z.custom<ImagineUIMessage>()).min(1),
  trigger: z.string(),
  id: z.string(),
  artifactId: z.string(),
  projectId: z.string(),
});

export type ChatRequestBodyType = z.infer<typeof chatRequestBodySchema>;