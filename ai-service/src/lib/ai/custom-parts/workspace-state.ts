import { z } from "zod";

export const workspaceStateUIDataPartSchema = z.object({
    state: z.enum(["ready"]),
    workspaceUrl: z.string(),
  });

export interface WorkspaceStateUIDataPart {
  type: "workspace-state";
  id: string;
  data: z.infer<typeof workspaceStateUIDataPartSchema>;
}
