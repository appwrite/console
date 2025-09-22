import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { getNestedRootDirectory, getRepositoryInfo } from '$lib/helpers/github';

export const load: PageLoad = async ({ url, params, parent }) => {
    const { installations: vcsInstallations, runtimesList, specificationsList } = await parent();

    const repository = url.searchParams.get('repo') || url.searchParams.get('repository');

    if (!repository) {
        redirect(302, `${base}/project-${params.region}-${params.project}/functions`);
    }

    const info = getRepositoryInfo(repository);
    if (!info) {
        redirect(302, `${base}/project-${params.region}-${params.project}/functions`);
    }

    const envParam = url.searchParams.get('env');
    const envKeys = envParam ? envParam.split(',').map((key: string) => key.trim()) : [];

    const runtime = url.searchParams.get('runtime');

    let installations = vcsInstallations || null;
    if (!installations) {
        try {
            installations = await sdk
                .forProject(params.region, params.project)
                .vcs.listInstallations();
        } catch (error) {
            installations = null;
        }
    }

    return {
        envKeys,
        runtime,
        runtimesList,
        installations,
        specificationsList,
        repository: {
            url: info.url,
            name: info.name,
            owner: info.owner,
            rootDirectory: getNestedRootDirectory(repository)
        }
    };
};
