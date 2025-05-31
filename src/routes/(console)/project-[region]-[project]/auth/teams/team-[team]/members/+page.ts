import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, url, route }) => {
    depends(Dependencies.MEMBERSHIPS);

    const teamId = params.team;
    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        search,
        limit,
        memberships: await sdk
            .forProject(params.region, params.project)
            .teams.listMemberships(
                teamId,
                [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
                search
            )
    };
};
