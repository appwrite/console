import type { Models } from '@appwrite.io/console';

/**
 * build VCS repo URL from the template response model.
 * supports GitHub, GitLab, and Bitbucket.
 *
 * important: We use 'master' as the branch name because GitHub (and other providers)
 * redirect 'master' to the repository's default branch, regardless of whether
 * its actually named 'main', 'master', or something else. This ensures the
 * link works across all repositories without needing to know their default branch.
 *
 * Example (GitHub): https://github.com/appwrite/templates-for-sites/tree/master/sveltekit/starter
 */
export function getTemplateSourceUrl(
    t: Models.TemplateSite | Models.TemplateFunction
): string | null {
    const owner = t.providerOwner;
    const repo = t.providerRepositoryId;
    const provider = t.vcsProvider; // e.g., "github"

    if (!owner || !repo || !provider) return null;

    // Map provider → host (extend if needed)
    const hostMap: Record<string, string> = {
        github: 'github.com',
        gitlab: 'gitlab.com',
        bitbucket: 'bitbucket.org'
    };

    const host = hostMap[provider.toLowerCase()];
    if (!host) return null;

    let folderPath: string | undefined;
    if (
        'providerRootDirectory' in t &&
        t.providerRootDirectory &&
        typeof t.providerRootDirectory === 'string'
    ) {
        folderPath = t.providerRootDirectory;
    } else if (
        'frameworks' in t &&
        t.frameworks?.length > 0 &&
        t.frameworks[0]?.providerRootDirectory &&
        typeof t.frameworks[0].providerRootDirectory === 'string'
    ) {
        folderPath = t.frameworks[0].providerRootDirectory;
    }

    let url = `https://${host}/${owner}/${repo}`;

    if (folderPath) {
        const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '');
        if (normalizedPath) {
            const providerLower = provider.toLowerCase();
            // Use 'master' as branch name - GitHub/GitLab/Bitbucket redirect it to default branch
            if (providerLower === 'github') {
                url = `${url}/tree/master/${normalizedPath}`;
            } else if (providerLower === 'gitlab') {
                url = `${url}/-/tree/master/${normalizedPath}`;
            } else if (providerLower === 'bitbucket') {
                url = `${url}/src/master/${normalizedPath}`;
            }
        }
    }

    return url;
}
