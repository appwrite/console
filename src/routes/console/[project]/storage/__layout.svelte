<script>
    import { tabs, title, backButton } from '$lib/stores/layout';

    const path = 'storage';
    title.set('Storage');
    backButton.set('');
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
