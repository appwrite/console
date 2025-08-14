import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import type { Models } from '@appwrite.io/console';

export const load: PageLoad = async ({ url, params }) => {
    // Get repository URL from query params
    const repoUrl = url.searchParams.get('repo');
    if (!repoUrl) {
        redirect(302, `${base}/project-${params.region}-${params.project}/sites`);
    }

    // Parse repository information
    const repoMatch = repoUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\?\s]+)/);
    if (!repoMatch) {
        redirect(302, `${base}/project-${params.region}-${params.project}/sites`);
    }

    const [, owner, repoName] = repoMatch;
    // Clean repository name (remove .git extension if present)
    const cleanRepoName = repoName.replace(/\.git$/, '');

    // Get environment variables from query params
    const envParam = url.searchParams.get('env');
    const envKeys = envParam ? envParam.split(',').map((key: string) => key.trim()) : [];

    // Try to fetch installations
    let installations: Models.InstallationList | null = null;
    try {
        installations = await sdk.forProject(params.region, params.project).vcs.listInstallations();
    } catch (error) {
        // If error, user might not have GitHub connected
        installations = null;
    }

    // Fetch frameworks list
    const frameworks = await sdk.forProject(params.region, params.project).sites.listFrameworks();

    return {
        repository: {
            url: repoUrl,
            owner,
            name: cleanRepoName
        },
        envKeys,
        installations,
        frameworks
    };
};
