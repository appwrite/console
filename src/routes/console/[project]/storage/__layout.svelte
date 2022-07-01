<script>
    import { afterNavigate } from '$app/navigation';

    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'storage';

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
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
    }
</script>

<svelte:head>
    <title>Appwrite - Storage</title>
</svelte:head>

<slot />
