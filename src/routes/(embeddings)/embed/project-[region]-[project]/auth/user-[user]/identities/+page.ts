import type { PageLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/auth/user-[user]/header.svelte';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { queries, queryParamToMap } from '$lib/components/filters';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.USER_IDENTITIES);

    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);
    const search = getSearch(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const [user, identities] = await Promise.all([
        sdk.forProject(params.region, params.project).users.get(params.user),
        sdk.forProject(params.region, params.project).users.listIdentities({
            queries: [
                Query.equal('userId', params.user),
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc(''),
                ...parsedQueries.values()
            ],
            search
        })
    ]);

    return {
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/auth`,
        path: `${base}/embed/project-${params.region}-${params.project}/auth/user-${params.user}`,
        user,
        offset,
        limit,
        query,
        search,
        identities
    };
};

