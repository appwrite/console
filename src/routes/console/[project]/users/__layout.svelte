<script lang="ts">
    import { tabs, title, backButton } from '$lib/stores/layout';

    const path = 'users';
    title.set('Users');
    backButton.set('');
    tabs.set([
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
    ]);
</script>

<svelte:head>
    <title>Appwrite - Users</title>
</svelte:head>

<slot />
