import type { PageLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/auth/teams/team-[team]/header.svelte';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ params, depends, url, route }) => {
    depends(Dependencies.MEMBERSHIPS);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    const [team, memberships] = await Promise.all([
        sdk.forProject(params.region, params.project).teams.get({ teamId: params.team }),
        sdk.forProject(params.region, params.project).teams.listMemberships({
            teamId: params.team,
            queries: [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
            search
        })
    ]);

    return {
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/auth/teams`,
        path: `${base}/embed/project-${params.region}-${params.project}/auth/teams/team-${params.team}`,
        team,
        offset,
        search,
        limit,
        memberships
    };
};
