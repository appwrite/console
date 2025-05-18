import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';

export const load: PageLoad = async ({ url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    const queries = [Query.offset(offset), Query.limit(limit), Query.orderDesc('')];

    const organizations = !isCloud
        ? await sdk.forConsole.teams.list(queries)
        : await sdk.forConsole.billing.listOrganization(queries);

    return {
        offset,
        limit,
        organizations
    };
};
