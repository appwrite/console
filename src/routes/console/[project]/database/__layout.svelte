<script>
    import { tabs, title } from '$lib/stores/layout';

    const path = 'database';
    title.set('Database');
    tabs.set([
        {
            href: path,
            title: 'Collections'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        }
    ]);
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

<slot />
