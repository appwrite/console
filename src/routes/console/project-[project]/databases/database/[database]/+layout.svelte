<script>
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { breadcrumb, updateLayout } from '$lib/stores/layout';
    import { database } from './store';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    const databaseId = $page.params.database;
    const path = `databases/database/${databaseId}`;

    onMount(handle);
    afterNavigate(handle);
    let loaded = false;
    async function handle(event = null) {
        const promise = database.load(databaseId);
        if ($database?.$id !== databaseId) {
            await promise;
        }

        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
