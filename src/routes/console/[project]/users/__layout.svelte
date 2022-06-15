<script lang="ts">
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';

    const path = 'users';
    title.set('Users');
    backButton.set('');

    copyData.set({
        text: '',
        value: ''
    });
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
