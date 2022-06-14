<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import { tabs, title, backButton } from '$lib/stores/layout';
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

    backButton.set(`${base}/console/${$page.params.project}/users/teams`);

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
