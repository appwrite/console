<script lang="ts">
    import { page } from '$app/stores';
    import { browser } from '$app/env';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { doc } from './store';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;
    const path = `databases/database/${databaseId}/collection/${collectionId}/document/${documentId}`;

    $: {
        if (browser) {
            doc.load(collectionId, documentId);
        }
    }

    $: {
        if ($doc) {
            title.set(`Document - ${$doc.$id}`);
        }
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
</script>

<svelte:head>
    <title>Appwrite - Database Document</title>
</svelte:head>

<slot />
