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

    async function listAllVariables() {
        const allVariables = [];
        let nextOffset = 0;
        let total = 0;

        do {
            const response = await projectSdk.projectApi.listVariables({
                queries: [Query.limit(limit), Query.offset(nextOffset)]
            });

            allVariables.push(...response.variables);
            total = response.total;
            nextOffset += response.variables.length;
        } while (nextOffset < total);

        return {
            total,
            variables: allVariables
        };
    }

    const [variables, allVariables, installations] = await Promise.all([
        projectSdk.projectApi.listVariables({
            queries: [Query.limit(limit), Query.offset(variablesOffset)]
        }),
        listAllVariables(),
        projectSdk.vcs.listInstallations({
            queries: [Query.limit(limit), Query.offset(offset)]
        })
    ]);

    return {
        limit,
        offset,
        variablesOffset,
        variables,
        allVariables,
        installations
    };
};
