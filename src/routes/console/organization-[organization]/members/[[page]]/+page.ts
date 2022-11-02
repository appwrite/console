import { PAGE_LIMIT } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { sdkForConsole } from '$lib/stores/sdk';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const page = Number(params.page);
    const offset = pageToOffset(page, PAGE_LIMIT);

    return {
        offset,
        organizationMembers: await sdkForConsole.teams.listMemberships(params.organization, [
            Query.limit(PAGE_LIMIT),
            Query.offset(offset)
        ])
    };
};
