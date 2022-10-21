<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { bucket } from './store';

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
    const path = `storage/bucket/${bucketId}`;

    let loaded = false;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        const promise = bucket.load(bucketId);
        if ($bucket?.$id !== bucketId) {
            await promise;
        }

        updateLayout({
            navigate: event,
            title: $bucket.name,
            level: 4,
            breadcrumbs: {
                title: $bucket.name,
                href: `storage/bucket/${bucketId}`
            },
            copy: {
                text: 'Bucket ID',
                value: bucketId
            },
            back: `${base}/console/project-${projectId}/storage`,

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
        loaded = true;
    }
</script>

<svelte:head>
    <title>Bucket - Appwrite</title>
</svelte:head>

{#if $bucket && loaded}
    <slot />
{/if}
