<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import { file } from './store';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const bucketId = $page.params.bucket;
    const fileId = $page.params.file;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        const promise = file.load(bucketId, fileId);
        if ($file?.$id !== fileId) {
            await promise;
        }

        updateLayout({
            navigate: event,
            level: 5,
            breadcrumbs: {
                href: `file/${fileId}`,
                title: $file.name
            },
            back: `${base}/console/project-${$page.params.project}/storage/bucket/${bucketId}`,
            title: $file.name,
            copy: {
                text: 'File ID',
                value: fileId
            },
            tabs: []
        });
    }
</script>

<svelte:head>
    <title>Appwrite - File</title>
</svelte:head>

{#if $file}
    <slot />
{/if}
