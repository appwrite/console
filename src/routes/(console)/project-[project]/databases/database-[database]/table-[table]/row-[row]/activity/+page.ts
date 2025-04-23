import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        logs: await sdk.forProject.databases.listDocumentLogs(
            params.database,
            params.table,
            params.row,
            [Query.limit(limit), Query.offset(offset)]
        )
    };
};
