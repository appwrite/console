<script>
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { database } from './store';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    const databaseId = $page.params.database;

    onMount(handle);
    afterNavigate(handle);
    let loaded = false;
    async function handle() {
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
    <title>Database - Appwrite</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
