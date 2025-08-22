import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, params, parent }) => {
    // Get repository URL from query params
    const repoUrl = url.searchParams.get('repo');
    if (!repoUrl) {
        redirect(302, `${base}/project-${params.region}-${params.project}/functions`);
    }

    // Parse repository information
    const repoMatch = repoUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\?\s]+)/);
    if (!repoMatch) {
        redirect(302, `${base}/project-${params.region}-${params.project}/functions`);
    }

    const [, owner, repoName] = repoMatch;
    // Clean repository name (remove .git extension if present)
    const cleanRepoName = repoName.replace(/\.git$/, '');

    // Get environment variables from query params
    const envParam = url.searchParams.get('env');
    const envKeys = envParam ? envParam.split(',').map((key: string) => key.trim()) : [];

    // Get runtime from query params
    const runtime = url.searchParams.get('runtime');

    // Get parent data (installations, runtimesList, specificationsList)
    const parentData = await parent();

    // Try to fetch installations
    let installations = parentData.installations || null;
    if (!installations) {
        try {
            installations = await sdk
                .forProject(params.region, params.project)
                .vcs.listInstallations();
        } catch (error) {
            // If error, user might not have GitHub connected
            installations = null;
        }
    }

    return {
        repository: {
            url: repoUrl,
            owner,
            name: cleanRepoName
        },
        envKeys,
        runtime,
        installations,
        runtimesList: parentData.runtimesList,
        specificationsList: parentData.specificationsList
    };
};
