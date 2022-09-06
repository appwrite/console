<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { collection, documentList } from './store';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;

    const path = `databases/database/${databaseId}/collection/${collectionId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($collection?.$id !== collectionId) {
            await collection.load(collectionId);
        }
        if ($collection) {
            await documentList.load($collection.$id, [], 12, 0);
        }
        updateLayout({
            navigate: event,
            title: $collection.name,
            back: `${base}/console/project-${$page.params.project}/database`,
            copy: {
                text: 'Collection ID',
                value: collectionId
            },
            level: 5,
            breadcrumbs: {
                href: `collection/${collectionId}`,
                title: $collection.name
            },
            tabs: [
                {
                    href: path,
                    title: 'Documents'
                },
                {
                    href: `${path}/attributes`,
                    title: 'Attributes'
                },
                {
                    href: `${path}/indexes`,
                    title: 'Indexes'
                },
                {
                    href: `${path}/settings`,
                    title: 'Settings'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - {$collection?.name ?? 'Collection'}</title>
</svelte:head>

{#if $collection && $documentList}
    <slot />
{/if}
