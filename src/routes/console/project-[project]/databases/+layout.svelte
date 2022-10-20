<script>
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'databases';

    onMount(handle);
    afterNavigate(handle);

    let loaded = false;

    function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Databases',
            tabs: [
                {
                    href: path,
                    title: 'Databases'
                },
                {
                    href: `${path}/usage`,
                    title: 'Usage'
                }
            ],
            level: 3,
            breadcrumbs: {
                href: 'databases',
                title: 'Databases'
            }
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Database - Appwrite</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
