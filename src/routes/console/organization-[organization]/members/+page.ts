import { PAGE_LIMIT } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, params }) => {
    const page = Number(url.searchParams.get('page'));
    const offset = pageToOffset(page, PAGE_LIMIT);

    return {
        offset,
        organizationMembers: await sdk.forConsole.teams.listMemberships(params.organization, [
            Query.limit(PAGE_LIMIT),
            Query.offset(offset)
        ])
    };
};
