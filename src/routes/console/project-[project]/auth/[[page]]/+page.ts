import { Query } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
    const page = Number(params.page);
    const offset = pageToOffset(page, PAGE_LIMIT);
    const search = url.search.slice(1) ?? undefined;

    return {
        offset,
        search,
        page,
        users: await sdkForProject().users.list(
            [Query.limit(PAGE_LIMIT), Query.offset(offset), Query.orderDesc('$createdAt')],
            search
        )
    };
};
