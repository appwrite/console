import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import type { Command, Searcher } from '../commands';
import type { Models } from '@appwrite.io/console';
import { base } from '$app/paths';
import { IconUserCircle } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';

const getTeamCommand = (team: Models.Team<Models.Preferences>, region: string, projectId: string) =>
    ({
        label: team.name,
        callback: () => {
            goto(`${base}/project-${region}-${projectId}/auth/teams/team-${team.$id}`);
        },
        group: 'teams',
        icon: IconUserCircle
    }) satisfies Command;

export const teamSearcher = (async (query: string) => {
    const { teams } = await sdk
        .forProject(page.params.region, page.params.project)
        .teams.list([], query);

    if (teams.length === 1) {
        return [
            getTeamCommand(teams[0], page.params.region, page.params.project),
            {
                label: 'Go to members',
                callback: () => {
                    goto(
                        `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${teams[0].$id}/members`
                    );
                },
                group: 'teams',
                nested: true
            },

            {
                label: 'Go to activity',
                callback: () => {
                    goto(
                        `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${teams[0].$id}/activity`
                    );
                },
                group: 'teams',
                nested: true
            }
        ];
    }
    return teams.map((team) => getTeamCommand(team, page.params.region, page.params.project));
}) satisfies Searcher;
