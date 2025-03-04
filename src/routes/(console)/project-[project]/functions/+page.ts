import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';

export const load = async ({ url, depends, route, parent }) => {
    depends(Dependencies.FUNCTIONS);
    const { templatesList } = await parent();

    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        functions: await sdk.forProject.functions.list([
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('')
        ]),
        templatesList
    };
};
