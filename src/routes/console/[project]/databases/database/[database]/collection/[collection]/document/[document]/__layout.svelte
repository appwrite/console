<script lang="ts">
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { doc } from './store';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;
    const path = `databases/database/${databaseId}/collection/${collectionId}/document/${documentId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($doc?.$id !== documentId) {
            await doc.load(collectionId, documentId);
        }
        updateLayout({
            navigate: event,
            title: `Document - ${$doc.$id}`,
            tabs: [
                {
                    href: path,
                    title: 'Overview'
                },
                {
                    href: `${path}/activity`,
                    title: 'Activity'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Database Document</title>
</svelte:head>

{#if $doc}
    <slot />
{/if}
