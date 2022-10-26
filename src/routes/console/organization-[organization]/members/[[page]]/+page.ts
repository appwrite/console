import { PAGE_LIMIT } from '$lib/constants';
import { sdkForConsole } from '$lib/stores/sdk';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const page = Number(params.page);
    const offset = page ? page * 5 - 5 : 0;

    return {
        organizationMembers: await sdkForConsole.teams.listMemberships(params.organization, [
            Query.limit(PAGE_LIMIT),
            Query.offset(offset)
        ])
    };
};
