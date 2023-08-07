<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import CreateCollection from './createCollection.svelte';
    import { showCreate } from './store';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Dependencies } from '$lib/constants';
    import {
        addSubPanel,
        registerCommands,
        registerSearchers,
        updateCommandGroupRanks
    } from '$lib/commandCenter';
    import { collectionsSearcher } from '$lib/commandCenter/searchers';
    import { CollectionsPanel } from '$lib/commandCenter/panels';

    const project = $page.params.project;
    const databaseId = $page.params.database;

    async function handleCreate(event: CustomEvent<Models.Collection>) {
        $showCreate = false;
        await invalidate(Dependencies.DATABASE);
        await goto(
            `${base}/console/project-${project}/databases/database-${databaseId}/collection-${event.detail.$id}`
        );
    }

    $: $registerCommands([
        {
            label: 'Find collections',
            callback() {
                addSubPanel(CollectionsPanel);
            },
            keys: ['f', 'c'],
            group: 'collections',
            icon: 'search'
        },
        {
            label: 'Create collection',
            callback() {
                $showCreate = true;
                if (!$page.url.pathname.endsWith(databaseId)) {
                    goto(`/console/project-${project}/databases/database-${databaseId}`);
                }
            },
            keys: $page.url.pathname.endsWith(databaseId) ? ['c'] : ['c', 'c'],
            disabled: $page.url.pathname.includes('collection-'),
            group: 'collections',
            icon: 'plus'
        },
        {
            label: 'Go to collections',
            callback() {
                goto(`/console/project-${project}/databases/database-${databaseId}`);
            },
            disabled:
                $page.url.pathname.endsWith(databaseId) ||
                $page.url.pathname.includes('collection-'),
            keys: ['g', 'c'],
            group: 'collections'
        },
        {
            label: 'Go to usage',
            callback() {
                goto(`/console/project-${project}/databases/database-${databaseId}/usage`);
            },
            disabled:
                $page.url.pathname.includes('/usage') || $page.url.pathname.includes('collection-'),
            keys: ['g', 'u'],
            group: 'collections'
        },
        {
            label: 'Go to settings',
            callback() {
                goto(`/console/project-${project}/databases/database-${databaseId}/settings`);
            },
            disabled:
                $page.url.pathname.includes('/settings') ||
                $page.url.pathname.includes('collection-'),
            keys: ['g', 's'],
            group: 'collections'
        }
    ]);

    $registerSearchers(collectionsSearcher);

    $: $updateCommandGroupRanks({ collections: 10 });
</script>

<svelte:head>
    <title>Database - Appwrite</title>
</svelte:head>

<slot />

<CreateCollection bind:showCreate={$showCreate} on:created={handleCreate} />
