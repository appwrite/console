import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, PAGE_LIMIT);

    const invoices = await sdk.forConsole.billing.listInvoices(params.organization, [
        Query.offset(offset),
        Query.limit(limit),
        Query.orderDesc('$createdAt')
    ]);

    console.log(invoices);
    return {
        offset,
        invoices
    };
};
