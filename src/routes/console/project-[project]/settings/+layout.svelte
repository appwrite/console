<script>
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    let loaded = false;

    onMount(handle);
    afterNavigate(handle);

    function handle() {
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
