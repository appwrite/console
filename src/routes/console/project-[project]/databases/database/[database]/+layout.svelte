<script>
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { database } from './store';

    const databaseId = $page.params.database;
    const path = `databases/database/${databaseId}`;

    let loaded = false;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        const promise = database.load(databaseId);
        if ($database?.$id !== databaseId) {
            await promise;
        }

        updateLayout({
            navigate: event,
            back: `${base}/console/project-${$page.params.project}/databases`,
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
        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
