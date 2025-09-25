import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { getNestedRootDirectory, getRepositoryInfo } from '$lib/helpers/github';

export const load: PageLoad = async ({ url, params }) => {
    const repository = url.searchParams.get('repo') || url.searchParams.get('repository');

    if (!repository) {
        redirect(302, `${base}/project-${params.region}-${params.project}/sites`);
    }

    const info = getRepositoryInfo(repository);
    if (!info) {
        redirect(302, `${base}/project-${params.region}-${params.project}/sites`);
    }

    const envParam = url.searchParams.get('env');
    const envKeys = envParam ? envParam.split(',').map((key: string) => key.trim()) : [];

    const [frameworks, installations] = await Promise.all([
        sdk.forProject(params.region, params.project).sites.listFrameworks(),
        sdk
            .forProject(params.region, params.project)
            .vcs.listInstallations()
            .catch(() => null)
    ]);

    return {
        envKeys,
        frameworks,
        installations,
        repository: {
            url: info.url,
            name: info.name,
            owner: info.owner,
            rootDirectory: getNestedRootDirectory(repository)
        }
    };
};
