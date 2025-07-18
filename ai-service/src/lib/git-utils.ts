import { createSynapseClient } from "./synapse-http-client";
import { RepositoryFile } from "./types";

export class GitRepositoryUtils {
  constructor(private artifactId: string) {}

  async listRepositoryFileStrucrture(): Promise<RepositoryFile[]> {
    const synapse = createSynapseClient({
      artifactId: this.artifactId,
    });
    const files = await synapse.listFilesInDir({
      dirPath: "./",
      recursive: true,
      withContent: true,
      additionalIgnorePatterns: [],
    });
    return files.map((file) => ({
      path: file.path,
      content: file.content!,
    }));
  }
}

export async function getLastDiff(owner: string, repo: string) {
  try {
    // const { data: commits } = await octokit.repos.listCommits({
    //   owner,
    //   repo,
    // });

    // const lastCommit = commits[0];

    // const { data: diff } = await octokit.repos.getCommit({
    //   owner,
    //   repo,
    //   ref: lastCommit.sha,
    // });

    // return diff;
    return null;
  } catch (error) {
    console.warn("Could not get last diff:", error);
    return null;
  }
}
