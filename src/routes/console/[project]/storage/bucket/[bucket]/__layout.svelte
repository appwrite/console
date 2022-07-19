<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { bucket } from './store';

    const bucketId = $page.params.bucket;
    const path = `storage/bucket/${bucketId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($bucket?.$id !== bucketId) {
            await bucket.load(bucketId);
        }

        updateLayout({
            navigate: event,
            title: $bucket.name,
            copy: {
                text: bucketId,
                value: bucketId
            },
            tabs: [
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
            ]
        });
    }

    $: if ($bucket) {
        handle();
    }
</script>

<svelte:head>
    <title>Appwrite - Bucket</title>
</svelte:head>

<slot />
