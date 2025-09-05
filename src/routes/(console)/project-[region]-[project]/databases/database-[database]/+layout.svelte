<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import {
        addSubPanel,
        registerCommands,
        registerSearchers,
        updateCommandGroupRanks
    } from '$lib/commandCenter';
    import { tablesSearcher } from '$lib/commandCenter/searchers';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import CreateTable from './createTable.svelte';
    import { showCreate } from './store';
    import { TablesPanel } from '$lib/commandCenter/panels';
    import { canWriteTables, canWriteDatabases } from '$lib/stores/roles';
    import { showCreateBackup, showCreatePolicy } from './backups/store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { currentPlan } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { noWidthTransition } from '$lib/stores/sidebar';

    const project = page.params.project;
    const databaseId = page.params.database;

    async function handleCreate(event: CustomEvent<Models.Table>) {
        $showCreate = false;
        await invalidate(Dependencies.DATABASE);
        await goto(
            `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/table-${event.detail.$id}`
        );
    }

    $: $registerCommands([
        {
            label: 'Create table',
            callback() {
                $showCreate = true;
                if (!page.url.pathname.endsWith(databaseId)) {
                    goto(
                        `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}`
                    );
                }
            },
            keys: page.url.pathname.endsWith(databaseId) ? ['c'] : ['c', 'c'],
            disabled: page.url.pathname.includes('table-') || !$canWriteTables,
            group: 'databases',
            icon: IconPlus
        },
        {
            label: 'Create backup policy',
            callback: async () => {
                if (!page.url.pathname.endsWith('backups')) {
                    goto(
                        `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`
                    );
                }
                showCreatePolicy.set(true);
            },
            keys: page.url.pathname.endsWith('backups') ? ['c'] : ['c', 'p'],
            group: 'databases',
            icon: IconPlus,
            rank: page.url.pathname.endsWith('backups') ? 10 : 0,
            disabled: !isCloud || !$currentPlan?.backupsEnabled
        },
        {
            label: 'Create manual backup',
            callback: async () => {
                if (!page.url.pathname.endsWith('backups')) {
                    goto(
                        `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`
                    );
                }
                showCreateBackup.set(true);
            },
            keys: page.url.pathname.endsWith('backups') ? ['c'] : ['c', 'b'],
            group: 'databases',
            icon: IconPlus,
            rank: page.url.pathname.endsWith('backups') ? 10 : 0,
            disabled: !isCloud || !$currentPlan?.backupsEnabled
        },
        {
            label: 'Go to tables',
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}`
                );
            },
            disabled:
                page.url.pathname.endsWith(databaseId) || page.url.pathname.includes('table-'),
            keys: ['g', 'c'],
            group: 'databases'
        },
        {
            label: 'Go to usage',
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/usage`
                );
            },
            disabled: page.url.pathname.includes('/usage') || page.url.pathname.includes('table-'),
            keys: ['g', 'u'],
            group: 'databases'
        },
        {
            label: 'Go to backups',
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`
                );
            },
            disabled:
                page.url.pathname.includes('/backups') || page.url.pathname.includes('table-'),
            keys: ['g', 'b'],
            group: 'databases'
        },
        {
            label: 'Go to settings',
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/settings`
                );
            },
            disabled:
                page.url.pathname.includes('/settings') ||
                page.url.pathname.includes('table-') ||
                !$canWriteDatabases,
            keys: ['g', 's'],
            group: 'databases'
        },
        {
            label: 'Find tables',
            callback: () => {
                addSubPanel(TablesPanel);
            },
            group: 'databases',
            rank: -1
        }
    ]);

    $registerSearchers(tablesSearcher);

    $: $updateCommandGroupRanks({ tables: 10 });

    $noWidthTransition = true;
</script>

<svelte:head>
    <title>Database - Appwrite</title>
</svelte:head>

<slot />

<CreateTable bind:showCreate={$showCreate} on:created={handleCreate} />
