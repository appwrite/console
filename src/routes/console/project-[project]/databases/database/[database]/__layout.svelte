<script>
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
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
            back: `${base}/console/${$page.params.project}/databases`,
            copy: {
                text: 'Database ID',
                value: databaseId
            },
            title: $database.name,
            level: 4,
            breadcrumbs: {
                href: `database/${databaseId}`,
                title: $database.name
            },
            tabs: [
                {
                    href: path,
                    title: 'Collections'
                },
                {
                    href: `${path}/usage`,
                    title: 'Usage'
                },
                {
                    href: `${path}/settings`,
                    title: 'Settings'
                }
            ]
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

{#if $database && $database.$id === databaseId}
    <slot />
{/if}
