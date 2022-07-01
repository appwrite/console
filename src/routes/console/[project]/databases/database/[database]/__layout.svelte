<script>
    import { afterNavigate } from '$app/navigation';

    import { page } from '$app/stores';

    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { setDatabase } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { database } from './store';

    const databaseId = $page.params.database;
    const path = `databases/database/${databaseId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        if ($database?.$id !== databaseId) {
            setDatabase($page.params.database);
            await database.load();
            title.set(`Database - ${$database.name}`);
        } else if ($database) {
            title.set(`Database - ${$database.name}`);
        }
        backButton.set('');

        copyData.set({
            text: '',
            value: ''
        });

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
    }
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

{#if $database}
    <slot />
{/if}
