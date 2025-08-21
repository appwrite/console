import type { Models } from "@appwrite.io/console";

/**
 * Build VCS repo URL from the template response model.
 * Example (GitHub): https://github.com/appwrite/templates-for-sites
 */
export function getTemplateSourceUrl(
  t: Models.TemplateSite | Models.TemplateFunction
): string | null {
  const owner = t.providerOwner;
  const repo  = t.providerRepositoryId;
  const provider = t.vcsProvider; // e.g., "github"

  if (!owner || !repo || !provider) return null;

  // Map provider → host (extend if needed)
  const hostMap: Record<string, string> = {
    github: "github.com",
    gitlab: "gitlab.com",
    bitbucket: "bitbucket.org",
  };

  const host = hostMap[provider.toLowerCase()] ?? provider; // fallback

  return `https://${host}/${owner}/${repo}`;
}
