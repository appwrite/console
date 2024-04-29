import { queries, queryParamToMap } from '$lib/components/filters';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.USER_IDENTITIES);

    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);
    const search = getSearch(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const identities = await sdk.forProject.users.listIdentities(
        [
            Query.equal('userId', params.user),
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc(''),
            ...parsedQueries.values()
        ],
        search
    );

    return {
        offset,
        limit,
        query,
        search,
        identities
    };
};
