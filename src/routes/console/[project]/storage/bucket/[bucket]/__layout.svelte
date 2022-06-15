<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { bucket } from './store';

    const bucketId = $page.params.bucket;
    const path = `storage/bucket/${bucketId}`;

    $: {
        if (browser) {
            bucket.load(bucketId);
        }
    }

    $: {
        if ($bucket) {
            title.set($bucket.name);
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
            title: 'Files'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        },
        {
            href: `${path}/settings`,
            title: 'Settings'
        }
    ]);
</script>

<svelte:head>
    <title>Appwrite - Bucket</title>
</svelte:head>

<slot />
