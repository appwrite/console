<script lang="ts">
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { doc } from './store';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import Header from './header.svelte';
    import Breadcrumbs from './breadcrumbs.svelte';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = doc.load(databaseId, collectionId, documentId);
        if ($doc?.$id !== documentId) {
            await promise;
        }

        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Database Document</title>
</svelte:head>

{#if $doc}
    <slot />
{/if}
