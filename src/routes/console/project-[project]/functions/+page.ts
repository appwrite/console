import { Query } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, depends }) => {
    depends(Dependencies.FUNCTIONS);
    const page = Number(url.searchParams.get('page'));
    const limit = Number(url.searchParams.get('limit') ?? CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        functions: await sdk.forProject.functions.list([
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ])
    };
};
