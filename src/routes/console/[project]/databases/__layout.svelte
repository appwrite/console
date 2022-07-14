<script>
    import { afterNavigate } from '$app/navigation';

    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'databases';

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        title.set('Database');
        backButton.set('');

        copyData.set({
            text: '',
            value: ''
        });
        tabs.set([
            {
                href: path,
                title: 'Databases'
            },
            {
                href: `${path}/usage`,
                title: 'Usage'
            }
        ]);
    }
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

<slot />
