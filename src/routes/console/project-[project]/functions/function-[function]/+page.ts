import { Query, type Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { isSelfHosted } from '$lib/system';

export const load: PageLoad = async ({ params, depends, url, route, parent }) => {
    await parent();
    depends(Dependencies.DEPLOYMENTS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    let consoleVariables: Models.ConsoleVariables = null;
    if (isSelfHosted) {
        consoleVariables = await sdk.forConsole.console.variables();
    }

    return {
        offset,
        limit,
        deployments: await sdk.forProject.functions.listDeployments(params.function, [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('')
        ]),
        consoleVariables
    };
};
