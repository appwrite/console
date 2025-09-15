import type { PageLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/auth/teams/team-[team]/header.svelte';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';

export const load: PageLoad = async ({ params }) => {
    const team = await sdk
        .forProject(params.region, params.project)
        .teams.get({ teamId: params.team });

    return {
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/auth/teams`,
        path: `${base}/embed/project-${params.region}-${params.project}/auth/teams/team-${params.team}`,
        team
    };
};
