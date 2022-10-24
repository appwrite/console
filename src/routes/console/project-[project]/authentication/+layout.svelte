<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    onMount(handle);
    afterNavigate(handle);

    function handle() {
        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>Users - Appwrite</title>
</svelte:head>

<slot />
