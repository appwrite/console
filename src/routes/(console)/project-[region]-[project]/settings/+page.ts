import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url, params }) => {
    depends(Dependencies.PROJECT_VARIABLES);
    depends(Dependencies.PROJECT_INSTALLATIONS);
    const limit = PAGE_LIMIT;
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const variablesOffset = Number(url.searchParams.get('variablesOffset') ?? 0);
    const projectSdk = sdk.forProject(params.region, params.project);
    const [variables, installations] = await Promise.all([
        projectSdk.projectApi.listVariables({
            queries: [Query.limit(limit), Query.offset(variablesOffset)]
        }),
        projectSdk.vcs.listInstallations({
            queries: [Query.limit(limit), Query.offset(offset)]
        })
    ]);

    return {
        limit,
        offset,
        variablesOffset,
        variables,
        installations
    };
};
