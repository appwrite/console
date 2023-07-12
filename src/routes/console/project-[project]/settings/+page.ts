import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url }) => {
    depends(Dependencies.PROJECT_VARIABLES);
    depends(Dependencies.PROJECT_INSTALLATIONS);
    const limit = 1;
    const offset = Number(url.searchParams.get('offset') ?? 0);

    return {
        limit,
        offset,
        variables: await sdk.forProject.projectApi.listVariables(),
        installations: await sdk.forProject.vcs.listInstallations([
            Query.limit(limit),
            Query.offset(offset)
        ])
    };
};
