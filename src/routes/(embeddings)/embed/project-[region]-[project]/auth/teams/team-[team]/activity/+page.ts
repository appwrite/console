import type { PageLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/auth/teams/team-[team]/header.svelte';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import { Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ params, url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    const [team, logs] = await Promise.all([
        sdk.forProject(params.region, params.project).teams.get({ teamId: params.team }),
        sdk.forProject(params.region, params.project).teams.listLogs({
            teamId: params.team,
            queries: [Query.limit(limit), Query.offset(offset)]
        })
    ]);

    return {
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/auth/teams`,
        path: `${base}/embed/project-${params.region}-${params.project}/auth/teams/team-${params.team}`,
        team,
        offset,
        limit,
        logs
    };
};

