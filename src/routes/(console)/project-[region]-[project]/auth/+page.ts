import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { showCreateUser } from './+page.svelte';

export const load: PageLoad = async ({ url, route, params }) => {
    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    if (typeof url.searchParams.get('create') === 'string') {
        showCreateUser.set(true);
    }

    const sdkInstance = sdk.forProject(params.region, params.project);

    // Fetch paginated users
    const users = await sdkInstance.users.list(
        [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
        search
    );

    // Separate call to get accurate total count
    const totalUsers = await sdkInstance.users.list(
        [Query.limit(1)], // Fetch minimal data
        search
    );

    return {
        offset,
        limit,
        search,
        page,
        users,
        total: totalUsers.total // Use accurate total count
    };
};
