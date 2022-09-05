<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'authentication';

    onMount(handle);
    afterNavigate(handle);

    let loaded = false;

    function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Authentication',
            level: 3,
            breadcrumbs: {
                title: 'Authentication',
                href: path
            },
            tabs: [
                {
                    href: path,
                    title: 'Users'
                },
                {
                    href: `${path}/teams`,
                    title: 'Teams'
                },
                {
                    href: `${path}/usage`,
                    title: 'Usage'
                },
                {
                    href: `${path}/security`,
                    title: 'Security'
                },
                {
                    href: `${path}/settings`,
                    title: 'Settings'
                }
            ]
        });

        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Users</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
