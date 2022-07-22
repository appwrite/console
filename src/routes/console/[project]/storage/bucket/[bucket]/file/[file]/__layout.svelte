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
        if ($file?.$id !== fileId) {
            await file.load(bucketId, fileId);
        }

        updateLayout({
            navigate: event,
            back: `${base}/console/${$page.params.project}/storage/bucket/${bucketId}`,
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

<slot />
