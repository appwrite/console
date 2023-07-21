<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { project } from '../store';
    import { showCreateUser } from './+page.svelte';
    import { showCreateTeam } from './teams/+page.svelte';

    $: $registerCommands([
        {
            label: 'Create user',
            callback: async () => {
                if (!$page.url.pathname.endsWith('auth')) {
                    await goto(`/console/project-${$project.$id}/auth`);
                }
                showCreateUser.set(true);
            },
            keys: $page.url.pathname.endsWith('auth') ? ['c'] : ['c', 'u'],

            group: 'auth',
            icon: 'plus',
            rank: $page.url.pathname.endsWith('auth') ? 10 : 0
        },
        {
            label: 'Create team',
            callback: async () => {
                if (!$page.url.pathname.endsWith('teams')) {
                    await goto(`/console/project-${$project.$id}/auth/teams`);
                }
                showCreateTeam.set(true);
            },
            keys: $page.url.pathname.endsWith('teams') ? ['c'] : ['c', 't'],

            group: 'auth',
            icon: 'plus',
            rank: $page.url.pathname.endsWith('teams') ? 10 : 0
        },
        {
            label: 'Go to teams',
            keys: ['g', 't'],
            callback() {
                goto(`/console/project-${$project.$id}/auth/teams`);
            },
            group: 'auth',
            disabled: $page.url.pathname.endsWith('teams')
        },
        {
            label: 'Go to usage',
            keys: ['g', 'u'],
            callback() {
                goto(`/console/project-${$project.$id}/auth/usage`);
            },
            group: 'auth',
            disabled: $page.url.pathname.endsWith('usage')
        },
        {
            label: 'Go to security',
            keys: ['g', 'e'],
            callback() {
                goto(`/console/project-${$project.$id}/auth/security`);
            },
            group: 'auth',
            disabled: $page.url.pathname.endsWith('security')
        },
        {
            label: 'Go to settings',
            keys: ['g', 's'],
            callback() {
                goto(`/console/project-${$project.$id}/auth/settings`);
            },
            group: 'auth',
            disabled: $page.url.pathname.endsWith('settings')
        }
    ]);

    $: $updateCommandGroupRanks((prev) => ({ ...prev, auth: 200 }));
</script>

<svelte:head>
    <title>Auth - Appwrite</title>
</svelte:head>

<slot />
