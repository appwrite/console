<script lang="ts">
    import { page } from '$app/stores';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { doc } from './store';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;
    const path = `databases/database/${databaseId}/collection/${collectionId}/document/${documentId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        if ($doc?.$id !== documentId) {
            await doc.load(collectionId, documentId);
            title.set(`Document - ${$doc.$id}`);
        } else if ($doc) {
            title.set(`Document - ${$doc.$id}`);
        }

        backButton.set('');

        copyData.set({
            text: '',
            value: ''
        });

        tabs.set([
            {
                href: path,
                title: 'Overview'
            },
            {
                href: `${path}/activity`,
                title: 'Activity'
            }
        ]);
    }
</script>

<svelte:head>
    <title>Appwrite - Database Document</title>
</svelte:head>

<slot />
