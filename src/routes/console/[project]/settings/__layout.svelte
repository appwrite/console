<script>
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'settings';

    onMount(handle);
    afterNavigate(handle);

    function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Settings',
            level: 3,
            breadcrumbs: {
                title: 'Settings',
                href: '#'
            },
            tabs: [
                {
                    href: path,
                    title: 'Overview'
                },
                {
                    href: `${path}/services`,
                    title: 'Services'
                },
                {
                    href: `${path}/domains`,
                    title: 'Custom Domains'
                },
                {
                    href: `${path}/members`,
                    title: 'Members'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Settings</title>
</svelte:head>

<slot />
