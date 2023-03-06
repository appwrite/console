import { Query } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset, redirectOnOffsetOverflow } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { prefs } from '$lib/stores/user';

export const load: PageLoad = async ({ params, parent, depends, url }) => {
    await parent();
    depends(Dependencies.DATABASE);

    const page = Number(params.page);

    const customPrefs = get(prefs);

    const limit =
        customPrefs?.preferredView === 'list' ? customPrefs?.pageLimit ?? PAGE_LIMIT : CARD_LIMIT;
    const offset = pageToOffset(page, limit);

    const collections = await sdkForProject.databases.listCollections(params.database, [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt')
    ]);

    await redirectOnOffsetOverflow(
        offset,
        page,
        collections.total,
        params.project,
        `databases/database-${params.database}`,
        url.search
    );

    return {
        offset,
        collections
    };
};
