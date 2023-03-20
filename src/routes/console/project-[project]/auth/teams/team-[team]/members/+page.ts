import { Query } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, url }) => {
    depends(Dependencies.MEMBERSHIPS);
    const teamId = params.team;
    const page = Number(url.searchParams.get('page'));
    const limit = Number(url.searchParams.get('limit') ?? PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const search = url.searchParams.get('search') ?? undefined;

    return {
        offset,
        search,
        limit,
        memberships: await sdk.forProject.teams.listMemberships(
            teamId,
            [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')],
            search
        )
    };
};
