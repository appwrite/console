import type { PageLoad } from './$types';
import { CARD_LIMIT } from '$lib/constants';
import { Query } from '@appwrite.io/console';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { getTeamOrOrganizationList } from '$lib/stores/organization';

export const load: PageLoad = async ({ url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    const queries = [Query.offset(offset), Query.limit(limit), Query.orderDesc('')];

    const organizations = await getTeamOrOrganizationList(queries);

    return {
        offset,
        limit,
        organizations
    };
};
