<script lang="ts">
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { team } from './store';
    import { afterNavigate } from '$app/navigation';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Breadcrumbs from './breadcrumbs.svelte';

    const teamId = $page.params.team;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = team.load(teamId);

        if ($team?.$id !== teamId) {
            await promise;
        }

        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Team</title>
</svelte:head>

{#if $team}
    <slot />
{/if}
