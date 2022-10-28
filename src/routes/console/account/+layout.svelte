<script lang="ts">
    import { updateLayout } from '$lib/stores/layout';
    import { afterNavigate } from '$app/navigation';
    import { onMount } from 'svelte';
    import Header from './header.svelte';
    import Breadcrumbs from './breadcrumbs.svelte';

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>User - Appwrite</title>
</svelte:head>

<slot />
