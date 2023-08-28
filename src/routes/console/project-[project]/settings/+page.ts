import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query, type Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { isSelfHosted } from '$lib/system';

export const load: PageLoad = async ({ depends, url }) => {
    depends(Dependencies.PROJECT_VARIABLES);
    depends(Dependencies.PROJECT_INSTALLATIONS);
    const limit = PAGE_LIMIT;
    const offset = Number(url.searchParams.get('offset') ?? 0);
    let consoleVariables: Models.ConsoleVariables = null;
    if (isSelfHosted) {
        consoleVariables = await sdk.forConsole.console.variables();
    }

    return {
        limit,
        offset,
        variables: await sdk.forProject.projectApi.listVariables(),
        installations: await sdk.forProject.vcs.listInstallations([
            Query.limit(limit),
            Query.offset(offset)
        ]),
        consoleVariables
    };
};
