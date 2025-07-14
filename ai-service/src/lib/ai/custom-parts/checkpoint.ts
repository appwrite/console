import { z } from "zod";

export const checkpointDataUIPartSchema = z.object({
  commitSha: z.string(),
  commitMessage: z.string(),
  timestamp: z.string(),
});

export interface CheckpointDataUIPart {
  type: "checkpoint";
  id: string;
  data: z.infer<typeof checkpointDataUIPartSchema>;
}
