<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { base } from '$app/paths';
    import { file } from './store';

    const bucketId = $page.params.bucket;
    const fileId = $page.params.file;

    $: {
        if (browser) {
            file.load(bucketId, fileId);
        }
    }

    $: {
        if ($file) {
            title.set($file.name);
        }
    }

    backButton.set(`${base}/console/${$page.params.project}/storage/bucket/${bucketId}`);

    copyData.set({
        text: fileId,
        value: fileId
    });
    tabs.set([]);
</script>

<svelte:head>
    <title>Appwrite - File</title>
</svelte:head>

<slot />
