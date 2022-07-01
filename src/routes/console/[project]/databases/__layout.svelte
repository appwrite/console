<script>
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';

    title.set('Databases');
    backButton.set('');
    tabs.set([]);

    copyData.set({
        text: '',
        value: ''
    });
</script>

<svelte:head>
    <title>Appwrite - Databases</title>
</svelte:head>

<slot />
