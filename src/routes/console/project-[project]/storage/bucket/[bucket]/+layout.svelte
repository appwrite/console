<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { bucket } from './store';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    const bucketId = $page.params.bucket;

    let loaded = false;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = bucket.load(bucketId);
        if ($bucket?.$id !== bucketId) {
            await promise;
        }

        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });

        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Bucket</title>
</svelte:head>

{#if $bucket && loaded}
    <slot />
{/if}
