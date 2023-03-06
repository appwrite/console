import { Query } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset, redirectOnOffsetOverflow } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { customPageLimit } from '$lib/stores/layout';
import { get } from 'svelte/store';
import { prefs } from '$lib/stores/user';

export const load: PageLoad = async ({ params, parent, depends, url }) => {
    await parent();
    depends(Dependencies.DATABASES);

    const page = Number(params.page);
    const limit = get(prefs)?.preferredView === 'list' ? get(customPageLimit) : CARD_LIMIT;

    const offset = pageToOffset(page, limit);

    const databases = await sdkForProject.databases.list([
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt')
    ]);

    await redirectOnOffsetOverflow(
        offset,
        page,
        databases.total,
        params.project,
        'databases',
        url.search
    );

    return {
        offset,
        databases
    };
};
