<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { TeamsPanel, UsersPanel } from '$lib/commandCenter/panels';
    import { readOnly } from '$lib/stores/billing';
    import { canWriteTeams, canWriteUsers } from '$lib/stores/roles';
    import { GRACE_PERIOD_OVERRIDE } from '$lib/system';
    import { showCreateUser } from './+page.svelte';
    import { showCreateTeam } from './teams/+page.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    $: $registerCommands([
        {
            label: 'Create user',
            callback: async () => {
                if (!page.url.pathname.endsWith('auth')) {
                    await goto(getProjectRoute('/auth'));
                }
                showCreateUser.set(true);
            },
            keys: page.url.pathname.endsWith('auth') ? ['c'] : ['c', 'u'],
            group: 'users',
            icon: IconPlus,
            rank: page.url.pathname.endsWith('auth') ? 10 : 0,
            disabled: ($readOnly && !GRACE_PERIOD_OVERRIDE) || !$canWriteUsers
        },
        {
            label: 'Create team',
            callback: async () => {
                if (!page.url.pathname.endsWith('teams')) {
                    await goto(getProjectRoute('/auth/teams'));
                }
                showCreateTeam.set(true);
            },
            keys: page.url.pathname.endsWith('teams') ? ['c'] : ['c', 't'],

            group: 'teams',
            icon: IconPlus,
            rank: page.url.pathname.endsWith('teams') ? 10 : 0,
            disabled: ($readOnly && !GRACE_PERIOD_OVERRIDE) || !$canWriteTeams
        },
        {
            label: 'Go to teams',
            keys: ['g', 't'],
            callback() {
                goto(getProjectRoute('/auth/teams'));
            },
            group: 'navigation',
            rank: 1,
            disabled: page.url.pathname.endsWith('teams')
        },
        {
            label: 'Go to usage',
            keys: ['g', 'u'],
            callback() {
                goto(getProjectRoute('/auth/usage'));
            },
            group: 'navigation',
            rank: 1,
            disabled: page.url.pathname.endsWith('usage')
        },
        {
            label: 'Go to security',
            keys: ['g', 'e'],
            callback() {
                goto(getProjectRoute('/auth/security'));
            },
            group: 'navigation',
            rank: 1,
            disabled: page.url.pathname.endsWith('security') || !$canWriteUsers
        },
        {
            label: 'Go to settings',
            keys: ['g', 's'],
            callback() {
                goto(getProjectRoute('/auth/settings'));
            },
            group: 'navigation',
            rank: 1,
            disabled: page.url.pathname.endsWith('settings') || !$canWriteUsers
        },
        {
            label: 'Find users',
            callback: () => {
                addSubPanel(UsersPanel);
            },
            group: 'users',
            rank: -1
        },
        {
            label: 'Find teams',
            callback: () => {
                addSubPanel(TeamsPanel);
            },
            group: 'teams',
            rank: -1
        }
    ]);

    // To prioritize the groups!
    $: $updateCommandGroupRanks({ users: 300, teams: 200, security: 100, navigation: 50 });
</script>

<svelte:head>
    <title>Auth - Appwrite</title>
</svelte:head>

<slot />
