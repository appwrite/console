import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { get } from 'svelte/store';
import type { Command, Searcher } from '../commands';
import type { Models } from '@appwrite.io/console';
import { base } from '$app/paths';
import { page } from '$app/stores';

const getTeamCommand = (team: Models.Team<Models.Preferences>, projectId: string) =>
    ({
        label: team.name,
        callback: () => {
            goto(`${base}/project-${projectId}/auth/teams/team-${team.$id}`);
        },
        group: 'teams',
        icon: 'user-circle'
    }) satisfies Command;

export const teamSearcher = (async (query: string) => {
    const $page = get(page);
    const projectId = get(project).$id;
    const { teams } = await sdk
        .forProject($page.params.region, $page.params.project)
        .teams.list([], query);

    if (teams.length === 1) {
        return [
            getTeamCommand(teams[0], projectId),
            {
                label: 'Go to members',
                callback: () => {
                    goto(`${base}/project-${projectId}/auth/teams/team-${teams[0].$id}/members`);
                },
                group: 'teams',
                nested: true
            },

            {
                label: 'Go to activity',
                callback: () => {
                    goto(`${base}/project-${projectId}/auth/teams/team-${teams[0].$id}/activity`);
                },
                group: 'teams',
                nested: true
            }
        ];
    }
    return teams.map((team) => getTeamCommand(team, projectId));
}) satisfies Searcher;
