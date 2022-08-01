<script lang="ts">
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { doc } from './store';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';

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
            title: 'Document',
            copy: { text: 'Document ID', value: $doc.$id },
            back: `${base}/console/${$page.params.project}/databases/database/${databaseId}/collection/${collectionId}`,
            level: 6,
            breadcrumbs: {
                title: $doc.$id,
                href: `document/${documentId}`
            },
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
