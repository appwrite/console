<script>
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    const path = 'settings';

    onMount(handle);
    afterNavigate(handle);

    function handle(event = null) {
        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Settings</title>
</svelte:head>

<slot />
