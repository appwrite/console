import { Query } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset, redirectOnOffsetOverflow } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { prefs } from '$lib/stores/user';

export const load: PageLoad = async ({ params, parent, depends, url }) => {
    await parent();
    depends(Dependencies.DATABASES);

    const customPrefs = get(prefs);
    const page = Number(params.page);
    const limit =
        customPrefs?.preferredView === 'list' ? customPrefs?.pageLimit ?? PAGE_LIMIT : CARD_LIMIT;

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
