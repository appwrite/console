<script>
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';

    const path = 'storage';
    title.set('Storage');
    backButton.set('');

    copyData.set({
        text: '',
        value: ''
    });
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
