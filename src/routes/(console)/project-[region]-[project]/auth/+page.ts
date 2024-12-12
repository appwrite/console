import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { showCreateUser } from './+page.svelte';

export const load: PageLoad = async ({ url, route, params }) => {
    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(params.project, url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    if (typeof url.searchParams.get('create') === 'string') {
        showCreateUser.set(true);
    }

    return {
        offset,
        limit,
        search,
        page,
        users: await sdk
            .forProject(params.region, params.project)
            .users.list([Query.limit(limit), Query.offset(offset), Query.orderDesc('')], search)
    };
};
