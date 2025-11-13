import type { Models } from '@appwrite.io/console';

/**
 * Example (GitHub): https://github.com/appwrite/templates-for-sites/tree/main/sveltekit/starter
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
            if (providerLower === 'github') {
                url = `${url}/tree/main/${normalizedPath}`;
            } else if (providerLower === 'gitlab') {
                url = `${url}/-/tree/main/${normalizedPath}`;
            } else if (providerLower === 'bitbucket') {
                url = `${url}/src/main/${normalizedPath}`;
            }
        }
    }

    return url;
}
