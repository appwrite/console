<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { tabs, title } from '$lib/stores/layout';
    import { team } from './store';

    const teamId = $page.params.team;
    const path = `users/teams/${teamId}`;

    $: {
        if (browser) {
            team.load(teamId);
        }
    }

    $: {
        if ($team) {
            title.set($team.name);
        }
    }
    // title.set('Teams');

    tabs.set([]);
    tabs.set([
        {
            href: path,
            title: 'Overview'
        },
        {
            href: `${path}/members`,
            title: 'Members'
        },
        {
            href: `${path}/activity`,
            title: 'Activity'
        }
    ]);
</script>

<svelte:head>
    <title>Appwrite - Team</title>
</svelte:head>

{#if $team}
    <slot />
{/if}
