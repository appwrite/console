<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { file } from './store';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Breadcrumbs from './breadcrumbs.svelte';

    const bucketId = $page.params.bucket;
    const fileId = $page.params.file;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = file.load(bucketId, fileId);
        if ($file?.$id !== fileId) {
            await promise;
        }

        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>Appwrite - File</title>
</svelte:head>

{#if $file}
    <slot />
{/if}
