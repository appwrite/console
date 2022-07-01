<script>
    import { afterNavigate } from '$app/navigation';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    onMount(handle);
    afterNavigate(handle);

    function handle() {
        title.set('Databases');
        backButton.set('');
        tabs.set([]);

        copyData.set({
            text: '',
            value: ''
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Databases</title>
</svelte:head>

<slot />
