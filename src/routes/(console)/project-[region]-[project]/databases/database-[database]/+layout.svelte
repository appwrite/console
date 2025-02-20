<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import {
        addSubPanel,
        registerCommands,
        registerSearchers,
        updateCommandGroupRanks
    } from '$lib/commandCenter';
    import { collectionsSearcher } from '$lib/commandCenter/searchers';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import CreateCollection from './createCollection.svelte';
    import { showCreate } from './store';
    import { CollectionsPanel } from '$lib/commandCenter/panels';
    import { canWriteCollections, canWriteDatabases } from '$lib/stores/roles';
    import { showCreateBackup, showCreatePolicy } from './backups/store';

    const project = $page.params.project;
    const databaseId = $page.params.database;

    async function handleCreate(event: CustomEvent<Models.Collection>) {
        $showCreate = false;
        await invalidate(Dependencies.DATABASE);
        await goto(
            `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}/collection-${event.detail.$id}`
        );
    }

    $: $registerCommands([
        {
            label: 'Create collection',
            callback() {
                $showCreate = true;
                if (!$page.url.pathname.endsWith(databaseId)) {
                    goto(
                        `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}`
                    );
                }
            },
            keys: $page.url.pathname.endsWith(databaseId) ? ['c'] : ['c', 'c'],
            disabled: $page.url.pathname.includes('collection-') || !$canWriteCollections,
            group: 'databases',
            icon: 'plus'
        },
        {
            label: 'Create backup policy',
            callback: async () => {
                if (!$page.url.pathname.endsWith('backups')) {
                    goto(
                        `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}/backups`
                    );
                }
                showCreatePolicy.set(true);
            },
            keys: $page.url.pathname.endsWith('backups') ? ['c'] : ['c', 'p'],
            group: 'databases',
            icon: 'plus',
            rank: $page.url.pathname.endsWith('backups') ? 10 : 0
        },
        {
            label: 'Create manual backup',
            callback: async () => {
                if (!$page.url.pathname.endsWith('backups')) {
                    goto(
                        `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}/backups`
                    );
                }
                showCreateBackup.set(true);
            },
            keys: $page.url.pathname.endsWith('backups') ? ['c'] : ['c', 'b'],
            group: 'databases',
            icon: 'plus',
            rank: $page.url.pathname.endsWith('backups') ? 10 : 0
        },
        {
            label: 'Go to collections',
            callback() {
                goto(
                    `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}`
                );
            },
            disabled:
                $page.url.pathname.endsWith(databaseId) ||
                $page.url.pathname.includes('collection-'),
            keys: ['g', 'c'],
            group: 'databases'
        },
        {
            label: 'Go to usage',
            callback() {
                goto(
                    `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}/usage`
                );
            },
            disabled:
                $page.url.pathname.includes('/usage') || $page.url.pathname.includes('collection-'),
            keys: ['g', 'u'],
            group: 'databases'
        },
        {
            label: 'Go to backups',
            callback() {
                goto(
                    `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}/backups`
                );
            },
            disabled:
                $page.url.pathname.includes('/backups') ||
                $page.url.pathname.includes('collection-'),
            keys: ['g', 'b'],
            group: 'databases'
        },
        {
            label: 'Go to settings',
            callback() {
                goto(
                    `${base}/project-${$page.params.region}-${project}/databases/database-${databaseId}/settings`
                );
            },
            disabled:
                $page.url.pathname.includes('/settings') ||
                $page.url.pathname.includes('collection-') ||
                !$canWriteDatabases,
            keys: ['g', 's'],
            group: 'databases'
        },
        {
            label: 'Find collections',
            callback: () => {
                addSubPanel(CollectionsPanel);
            },
            group: 'databases',
            rank: -1
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
