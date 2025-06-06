import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url, params }) => {
    depends(Dependencies.PROJECT_VARIABLES);
    depends(Dependencies.PROJECT_INSTALLATIONS);
    const limit = PAGE_LIMIT;
    const offset = Number(url.searchParams.get('offset') ?? 0);

    const [variables, installations] = await Promise.all([
        sdk.forProject(params.region, params.project).projectApi.listVariables(),
        sdk
            .forProject(params.region, params.project)
            .vcs.listInstallations([Query.limit(limit), Query.offset(offset)])
    ]);

    return {
        limit,
        offset,
        variables,
        installations
    };
};
