<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'users';

    onMount(handle);
    afterNavigate(handle);

    let loaded = false;

    function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Users',
            level: 3,
            breadcrumbs: {
                title: 'Users',
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
                    href: `${path}/authentication`,
                    title: 'Authentication'
                },
                {
                    href: `${path}/usage`,
                    title: 'Usage'
                },
                {
                    href: `${path}/security`,
                    title: 'Security'
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
