export function getNestedRootDirectory(repository: string): string | null {
    const match = repository.match(/\/tree\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
}

export function getBranchFromUrl(repository: string): string | null {
    const match = repository.match(/\/tree\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
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
        return false;
    }
}

export interface LoadBranchesResult {
    branches: string[];
    selectedBranch: string;
}

export interface LoadBranchesError {
    type: 'repository_missing' | 'load_failed' | 'empty_branches';
    message: string;
}

/**
 * Loads branches from a GitHub repository and selects the appropriate branch.
 * Selection priority: branchParam (if valid) > defaultBranch > first branch.
 */
export async function loadAndSelectBranch(
    owner: string,
    name: string,
    branchParam: string | null = null
): Promise<LoadBranchesResult | LoadBranchesError> {
    if (!owner || !name) {
        return {
            type: 'repository_missing',
            message: 'Repository information is missing. Please check the repository URL.'
        };
    }

    try {
        const [branchList, defaultBranch, isBranchValid] = await Promise.all([
            getBranches(owner, name),
            getDefaultBranch(owner, name),
            branchParam ? validateBranch(owner, name, branchParam) : Promise.resolve(false)
        ]);

        if (!branchList || branchList.length === 0) {
            return {
                type: 'empty_branches',
                message:
                    'Failed to load branches from repository. Please check the repository URL or try again.'
            };
        }

        const selectedBranch =
            branchParam && isBranchValid
                ? branchParam
                : defaultBranch && branchList.includes(defaultBranch)
                  ? defaultBranch
                  : branchList[0];

        return {
            branches: branchList,
            selectedBranch
        };
    } catch (error) {
        return {
            type: 'load_failed',
            message:
                'Failed to load branches from repository. Please check the repository URL or try again.'
        };
    }
}
