export type Template = {
  key?: string; // template slug, e.g. "magic-portfolio"
  frameworks?: Array<{ 
    key?: string;
    providerRootDirectory?: string;
  }>; // e.g. [{ key: "nextjs", providerRootDirectory: "./nextjs/magic-portfolio" }]
  providerOwner?: string; // e.g. "appwrite"
  providerRepositoryId?: string; // e.g. "templates-for-sites" or "template-for-store"
  repository?: string; // if API already returns full URL, use it
  repoUrl?: string;    // alias some builds may use
  source?: string;     // alias some builds may use
};

export function getTemplateSourceUrl(template: Template): string | null {
  // 1) Prefer a direct URL if the API already provides it
  const direct = template.repository || template.repoUrl || template.source;
  if (direct) return direct;

  // 2) Ensure we have the parts to build the GitHub URL
  const owner = template.providerOwner || "appwrite";
  const repo = template.providerRepositoryId || "templates-for-sites";
  const rootDir = template.frameworks?.[0]?.providerRootDirectory ?? "./";

  // strip leading "./"
  const cleanDir = rootDir.startsWith("./") ? rootDir.slice(2) : rootDir;

  if (!cleanDir || cleanDir === "") {
    return `https://github.com/${owner}/${repo}/tree/main`;
  }

  return `https://github.com/${owner}/${repo}/tree/main/${cleanDir}`;
}
