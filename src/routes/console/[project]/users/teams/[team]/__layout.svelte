<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { tabs, title } from '$lib/stores/layout';
    import { team } from './store';

    const teamId = $page.params.team;
    // const path = `users/teams/${projectId}`;

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
</script>

<svelte:head>
    <title>Appwrite - Team</title>
</svelte:head>

<slot />
