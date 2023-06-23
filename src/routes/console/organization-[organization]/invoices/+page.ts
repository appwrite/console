import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getPage, pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
    const page = getPage(url);
    // const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, PAGE_LIMIT);

    return {
        offset,
        invoices: await sdk.forConsole.projects.list([
            Query.offset(offset),
            Query.limit(PAGE_LIMIT),
            Query.equal('teamId', params.organization),
            Query.orderDesc('$createdAt')
        ])
    };
};
