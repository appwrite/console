<script>
    import { tabs, title } from '$lib/stores/layout';

    const path = 'storage';
    title.set('Storage');
    tabs.set([
        {
            href: path,
            title: 'Buckets'
        },
        {
            href: `${path}/usage`,
            title: 'Usage'
        }
    ]);
</script>

<svelte:head>
    <title>Appwrite - Storage</title>
</svelte:head>

<slot />
