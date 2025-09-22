import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { showCreateUser } from './+page.svelte';

export const load: PageLoad = async ({ url, route, params, depends }) => {
    depends(Dependencies.USERS);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    if (typeof url.searchParams.get('create') === 'string') {
        showCreateUser.set(true);
    }

    return {
        offset,
        limit,
        search,
        page,
        users: await sdk.forProject(params.region, params.project).users.list({
            queries: [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
            search
        })
    };
};
