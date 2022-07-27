<script>
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    onMount(handle);
    afterNavigate(handle);

    function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Functions',
            level: 3,
            breadcrumbs: {
                href: 'functions',
                title: 'Functions'
            }
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Functions</title>
</svelte:head>

<slot />
