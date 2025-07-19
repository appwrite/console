import { z } from "zod";


export enum WorkspaceStepId {
  CREATE_SANDBOX = "create-sandbox",
  REPOSITORY_SETUP = "repository-setup",
  INSTALL_DEPENDENCIES = "install-dependencies",
  START_DEV_SERVER = "start-dev-server",
}

export type OnStepUpdateFn = ({
  id,
  status,
  text
}: {
  id: WorkspaceStepId;
  status: "pending" | "in-progress" | "completed";
  text: string;
}) => void;

export const workspaceStepSchema = z.object({
  id: z.nativeEnum(WorkspaceStepId),
  status: z.enum(["pending", "in-progress", "completed"]),
  text: z.string(),
});

export const workspaceStateUIDataPartSchema = z.object({
    state: z.enum(["pending", "in-progress", "completed"]),
    steps: z.array(workspaceStepSchema),
    workspaceUrl: z.string().nullable(),
  });

export interface WorkspaceStateUIDataPart {
  type: "workspace-state";
  id: string;
  data: z.infer<typeof workspaceStateUIDataPartSchema>;
}
