<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';
    import { collection } from './store';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;

    onMount(handle);
    afterNavigate(handle);
    let loaded = false;
    async function handle() {
        const promise = collection.load(databaseId, collectionId);
        if ($collection?.$id !== collectionId) {
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
    <title>{$collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

{#if $collection && loaded}
    <slot />
{/if}
