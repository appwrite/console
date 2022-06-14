<script>
    import { tabs, title, backButton } from '$lib/stores/layout';

    title.set('Functions');
    backButton.set('');
    tabs.set([]);
</script>

<svelte:head>
    <title>Appwrite - Functions</title>
</svelte:head>

<slot />
