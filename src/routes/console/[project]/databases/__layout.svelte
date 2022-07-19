<script>
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    onMount(handle);
    afterNavigate(handle);

    let loaded = false;

    function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Databases'
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Databases</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
