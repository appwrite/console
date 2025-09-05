import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent, url }) => {
    const { account } = await parent();

    const projectId = url.searchParams.get('projectId');
    const repositoryId = url.searchParams.get('repositoryId');
    const installationId = url.searchParams.get('installationId');
    const providerPullRequestId = url.searchParams.get('providerPullRequestId');

    if (!installationId || !repositoryId || !providerPullRequestId) {
        redirect(303, `${base}`);
    }

    if (!account) {
        redirect(303, `${base}`);
    }

    return {
        projectId,
        repositoryId,
        installationId,
        providerPullRequestId
    };
};
