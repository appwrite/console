<script>
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';

    title.set('Functions');
    backButton.set('');
    tabs.set([]);

    copyData.set({
        text: '',
        value: ''
    });
</script>

<svelte:head>
    <title>Appwrite - Functions</title>
</svelte:head>

<slot />
