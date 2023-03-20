import { PAGE_LIMIT } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, params }) => {
    const page = Number(url.searchParams.get('page'));
    const limit = Number(url.searchParams.get('limit') ?? PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        organizationMembers: await sdk.forConsole.teams.listMemberships(params.organization, [
            Query.limit(limit),
            Query.offset(offset)
        ])
    };
};
