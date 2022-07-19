<script>
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { setDatabase } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { database } from './store';

    const databaseId = $page.params.database;

    const path = `databases/database/${databaseId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($database?.$id !== databaseId) {
            setDatabase($page.params.database);
            await database.load();
        }

        updateLayout({
            navigate: event,
            title: $database.name,
            tabs: [
                {
                    href: path,
                    title: 'Collections'
                },
                {
                    href: `${path}/usage`,
                    title: 'Usage'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

{#if $database}
    <slot />
{/if}
