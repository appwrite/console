export function getNestedRootDirectory(repository: string): string | null {
    const match = repository.match(/\/tree\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
}

export function getRepositoryInfo(
    repository: string
): { owner: string; name: string; url: string } | null {
    const match = repository
        .trim()
        .match(/(?:^|\/\/|@)github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?(?:$|[/?#])/i);

    if (!match) return null;

    const owner = decodeURIComponent(match[1]);
    const name = decodeURIComponent(match[2].replace(/\.git$/i, ''));

    const url = `https://github.com/${owner}/${name}`;

    return { owner, name, url };
}

export async function getLatestTag(owner: string, name: string): Promise<string | null> {
    try {
        const tagsResponse = await fetch(`https://api.github.com/repos/${owner}/${name}/tags`);
        if (!tagsResponse.ok) {
            return null;
        }

        const tags = await tagsResponse.json();
        if (tags.length > 0) {
            return tags[0].name;
        }

        return null;
    } catch (error) {
        console.error('Failed to fetch tags from GitHub:', error);
        return null;
    }
}

export async function getDefaultBranch(owner: string, name: string): Promise<string | null> {
    try {
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${name}`);

        if (!repoResponse.ok) {
            return null;
        }

        const repo = await repoResponse.json();
        return repo.default_branch || null;
    } catch (error) {
        console.error('Failed to fetch default branch from GitHub:', error);
        return null;
    }
}

export async function getBranches(owner: string, name: string): Promise<string[] | null> {
    try {
        const branchesResponse = await fetch(
            `https://api.github.com/repos/${owner}/${name}/branches`
        );
        if (!branchesResponse.ok) {
            return null;
        }

        const branches = await branchesResponse.json();
        return branches.map((branch) => branch.name);
    } catch (error) {
        console.error('Failed to fetch branches from GitHub:', error);
        return null;
    }
}

export async function validateBranch(
    owner: string,
    repo: string,
    branch: string
): Promise<boolean> {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`
        );
        return response.ok;
    } catch (error) {
        console.error('Failed to validate branch from GitHub:', error);
        return false;
    }
}
