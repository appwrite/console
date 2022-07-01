<script>
    import { browser } from '$app/env';

    import { page } from '$app/stores';

    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { setDatabase } from '$lib/stores/sdk';
    import { database } from './store';

    const databaseId = $page.params.database;
    const path = `databases/database/${databaseId}`;

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

    $: {
        if (browser) {
            setDatabase($page.params.database);
            database.load();
        }
    }
    $: if ($database) {
        title.set(`Database - ${$database.name}`);
    }
</script>

<svelte:head>
    <title>Appwrite - Database</title>
</svelte:head>

<slot />
