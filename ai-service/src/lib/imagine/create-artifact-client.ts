import { Client } from "@appwrite.io/console";
import { Imagine } from "./imagine-api-client";

export async function createImagineClient({
  projectId,
  token,
}: {
  projectId: string;
  token: string;
}) {
  const clientProject = new Client();
  clientProject
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(projectId)
    .setMode("admin")
    .setJWT(token);
  const imagineClient = new Imagine(clientProject);
  return imagineClient;
}