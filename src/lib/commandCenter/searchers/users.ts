import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import type { Command, Searcher } from '../commands';
import type { Models } from '@appwrite.io/console';
import { promptDeleteUser } from '$routes/(console)/project-[region]-[project]/auth/user-[user]/dangerZone.svelte';
import { base } from '$app/paths';
import { page } from '$app/stores';

const getUserCommand = (user: Models.User<Models.Preferences>, region: string, projectId: string) =>
    ({
        label: user.name,
        callback: () => {
            goto(`${base}/project-${region}-${projectId}/auth/user-${user.$id}`);
        },
        group: 'users',
        icon: 'user-circle'
    }) satisfies Command;

export const userSearcher = (async (query: string) => {
    const $page = get(page);
    const { users } = await sdk
        .forProject($page.params.region, $page.params.project)
        .users.list([], query || undefined);

    if (users.length === 1) {
        return [
            getUserCommand(users[0], $page.params.region, $page.params.project),
            {
                label: 'Delete user',
                callback: () => {
                    promptDeleteUser(users[0].$id);
                },
                group: 'users',
                nested: true,
                icon: 'trash'
            },
            {
                label: 'Go to activity',
                callback: () => {
                    goto(
                        `${base}/project-${$page.params.region}-${$page.params.project}/auth/user-${users[0].$id}/activity`
                    );
                },
                group: 'users',
                nested: true
            },
            {
                label: 'Go to sessions',
                callback: () => {
                    goto(
                        `${base}/project-${$page.params.region}-${$page.params.project}/auth/user-${users[0].$id}/sessions`
                    );
                },
                group: 'users',
                nested: true
            },
            {
                label: 'Go to memberships',
                callback: () => {
                    goto(
                        `${base}/project-${$page.params.region}-${$page.params.project}/auth/user-${users[0].$id}/memberships`
                    );
                },
                group: 'users',
                nested: true
            }
        ];
    }
    return users.map((user) => getUserCommand(user, $page.params.region, $page.params.project));
}) satisfies Searcher;
