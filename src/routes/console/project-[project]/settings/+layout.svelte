<script>
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    const path = 'settings';
    const projectId = $page.params.project;
    let loaded = false;

    onMount(handle);
    afterNavigate(handle);

    function handle(event = null) {
        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Settings - Appwrite</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
