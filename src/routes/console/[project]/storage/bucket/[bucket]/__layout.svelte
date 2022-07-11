<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { bucket } from './store';

    const bucketId = $page.params.bucket;
    const path = `storage/bucket/${bucketId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        if ($bucket?.$id !== bucketId) {
            await bucket.load(bucketId);
            title.set($bucket.name);
        } else if ($bucket) {
            title.set($bucket.name);
        }

        backButton.set(`${base}/console/${$page.params.project}/storage`);

        copyData.set({
            text: bucketId,
            value: bucketId
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
    }

    $: if ($bucket) {
        handle();
    }
</script>

<svelte:head>
    <title>Appwrite - Bucket</title>
</svelte:head>

<slot />
