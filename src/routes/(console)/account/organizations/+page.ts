import { CARD_LIMIT } from '$lib/constants';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    const queries = [Query.offset(offset), Query.limit(limit), Query.orderDesc('')];

    const organizations = isCloud
        ? await sdk.forConsole.organizations.list(queries)
        : await sdk.forConsole.teams.list(queries);

    return {
        offset,
        limit,
        organizations
    };
};
