<script lang="ts">
    import { browser } from '$app/env';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { collection } from './store';

    const collectionId = $page.params.collection;

    const path = `database/collection/${collectionId}`;

    $: {
        if (browser) {
            collection.load(collectionId);
        }
    }

    $: {
        if ($collection) {
            title.set($collection.name);
        }
    }

    backButton.set(`${base}/console/${$page.params.project}/database`);

    copyData.set({
        text: '',
        value: ''
    });

    tabs.set([
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
    ]);
</script>

<svelte:head>
    <title>Appwrite - {$collection?.name ?? 'Collection'}</title>
</svelte:head>

{#if $collection}
    <slot />
{/if}
