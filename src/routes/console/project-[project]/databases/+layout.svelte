<script>
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    onMount(handle);
    afterNavigate(handle);

    let loaded = false;
    function handle() {
        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
