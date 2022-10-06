<script>
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'settings';
    const projectId = $page.params.project;
    let loaded = false;

    onMount(handle);
    afterNavigate(handle);

    function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Settings',
            level: 3,
            breadcrumbs: {
                title: 'Settings',
                href: 'settings'
            },
            copy: {
                text: 'Project ID',
                value: projectId
            },
            tabs: [
                {
                    href: path,
                    title: 'Overview'
                },

                {
                    href: `${path}/domains`,
                    title: 'Custom Domains'
                },
                {
                    href: `${path}/webhooks`,
                    title: 'Webhooks'
                }
            ]
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Settings</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
