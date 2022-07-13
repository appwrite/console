<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import { file } from './store';

    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const bucketId = $page.params.bucket;
    const fileId = $page.params.file;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        if ($file?.$id !== fileId) {
            await file.load(bucketId, fileId);
            title.set($file.name);
        } else if ($file) {
            title.set($file.name);
        }
        backButton.set(`${base}/console/${$page.params.project}/storage/bucket/${bucketId}`);

        copyData.set({
            text: 'File ID',
            value: fileId
        });
        tabs.set([]);
    }
</script>

<svelte:head>
    <title>Appwrite - File</title>
</svelte:head>

<slot />
