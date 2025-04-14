import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, params, route, depends }) => {
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.MEMBERS);
    const page = getPage(url);
    const limit = getLimit('console', url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        organizationMembers: await sdk.forConsole.teams.listMemberships(params.organization, [
            Query.limit(limit),
            Query.offset(offset)
        ])
    };
};
