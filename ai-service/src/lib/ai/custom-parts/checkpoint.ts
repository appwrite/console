import { z } from "zod";

export const checkpointUIDataPartSchema = z.object({
  commitSha: z.string(),
  commitMessage: z.string(),
  timestamp: z.string(),
});

export interface CheckpointUIDataPart {
  type: "checkpoint";
  id: string;
  data: z.infer<typeof checkpointUIDataPartSchema>;
}
