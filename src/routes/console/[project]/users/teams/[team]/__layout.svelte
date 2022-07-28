<script lang="ts">
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import { updateLayout } from '$lib/stores/layout';
    import { team } from './store';
    import { afterNavigate } from '$app/navigation';
    import { onMount } from 'svelte';

    const teamId = $page.params.team;
    const path = `users/teams/${teamId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($team?.$id !== teamId) {
            await team.load(teamId);
        }

        updateLayout({
            navigate: event,
            title: $team.name,
            back: `${base}/console/${$page.params.project}/users/teams`,
            copy: {
                text: 'Team ID',
                value: teamId
            },
            tabs: [
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
            ]
        });
    }

    $: if ($team.name) {
        handle();
    }
</script>

<svelte:head>
    <title>Appwrite - Team</title>
</svelte:head>

{#if $team}
    <slot />
{/if}
