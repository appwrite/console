<script>
    import { tabs, title, backButton } from '$lib/stores/layout';

    const path = 'settings';
    title.set('Settings');
    backButton.set('');
    tabs.set([
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
    ]);
</script>

<svelte:head>
    <title>Appwrite - Settings</title>
</svelte:head>

<slot />
