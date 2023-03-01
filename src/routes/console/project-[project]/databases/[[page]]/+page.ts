import { Query } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { customPageLimit, preferredView } from '$lib/stores/layout';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const page = Number(params.page);
    const limit = get(preferredView) === 'list' ? get(customPageLimit) : CARD_LIMIT;

    const offset = pageToOffset(page, limit);

    return {
        offset,
        databases: await sdkForProject.databases.list([
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ])
    };
};
