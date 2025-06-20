<script lang="ts" context="module">
    import { writable } from 'svelte/store';
    import type { Option } from './columns/store';

    const createAttributeArgs = writable({
        showCreate: false,
        selectedOption: null as Option['name'] | null
    });

    export const initCreateColumn = (option: Option['name']) => {
        createAttributeArgs.set({ showCreate: true, selectedOption: option });
    };

    const showCreateIndex = writable(false);
    export const initCreateIndex = () => {
        showCreateIndex.set(true);
    };
</script>

<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { realtime } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from './store';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import CreateAttribute from './createColumn.svelte';
    import { CreateColumnPanel } from '$lib/commandCenter/panels';
    import { database } from '../store';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { page } from '$app/state';
    import CreateIndex from './indexes/createIndex.svelte';
    import { base } from '$app/paths';
    import { canWriteCollections } from '$lib/stores/roles';
    import { IconEye, IconLockClosed, IconPlus, IconPuzzle } from '@appwrite.io/pink-icons-svelte';

    onMount(() => {
        // TODO: change the events once terminologies are changed on the backend
        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe(['project', 'console'], (response) => {
                if (
                    response.events.includes('databases.*.collections.*.attributes.*') ||
                    response.events.includes('databases.*.collections.*.indexes.*')
                ) {
                    invalidate(Dependencies.TABLE);
                }
            });
    });

    $: $registerCommands([
        {
            label: 'Create row',
            keys: page.url.pathname.endsWith($collection.$id) ? ['c'] : ['c', 'd'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$collection?.$id}/create`
                );
            },
            icon: IconPlus,
            group: 'rows'
        },
        {
            label: 'Create column',
            keys: page.url.pathname.endsWith('attributes') ? ['c'] : ['c', 'a'],
            callback() {
                addSubPanel(CreateColumnPanel);
            },
            icon: IconPlus,
            group: 'columns',
            disabled: !$canWriteCollections
        },
        {
            label: 'Go to rows',
            keys: ['g', 'd'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$collection?.$id}`
                );
            },
            disabled: page.url.pathname.endsWith($collection.$id),
            group: 'tables'
        },
        {
            label: 'Go to columns',
            keys: ['g', 'a'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$collection?.$id}/attributes`
                );
            },
            disabled: page.url.pathname.endsWith('columns'),
            group: 'tables'
        },
        {
            label: 'Go to indexes',
            keys: ['g', 'i'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$collection?.$id}/indexes`
                );
            },
            disabled: page.url.pathname.endsWith('indexes'),
            group: 'tables'
        },
        {
            label: 'Go to activity',
            keys: ['g', 'c'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$collection?.$id}/activity`
                );
            },
            disabled: page.url.pathname.endsWith('activity'),
            group: 'tables'
        },
        {
            label: 'Go to usage',
            keys: ['g', 'u'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$collection?.$id}/usage`
                );
            },
            disabled: page.url.pathname.endsWith('usage'),
            group: 'tables'
        },
        {
            label: 'Go to settings',
            keys: ['g', 's'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$collection?.$id}/settings`
                );
            },
            disabled: page.url.pathname.endsWith('settings') || !$canWriteCollections,
            group: 'tables'
        },
        {
            label: 'Display Name',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/table-${$collection.$id}/settings#display-name`
                );
            },
            group: 'tables',
            disabled:
                page.url.pathname.endsWith('display-name') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: IconEye
        },
        {
            label: 'Permissions',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/table-${$collection.$id}/settings#permissions`
                );
            },
            group: 'tables',
            disabled:
                page.url.pathname.endsWith('permissions') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: IconPuzzle
        },
        {
            label: 'Row security',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/table-${$collection.$id}/settings#row-security`
                );
            },
            group: 'tables',
            disabled:
                page.url.pathname.endsWith('row-security') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: IconLockClosed
        },
        {
            label: 'Create index',
            keys: page.url.pathname.endsWith('indexes') ? ['c'] : ['c', 'i'],
            callback() {
                initCreateIndex();
            },
            icon: IconPlus,
            group: 'indexes',
            disabled: !$canWriteCollections
        }
    ]);

    $updateCommandGroupRanks({
        columns: 1000,
        rows: 900,
        tables: 800,
        indexes: 700
    });
</script>

<svelte:head>
    <title>{$collection?.name ?? 'Table'} - Appwrite</title>
</svelte:head>

<slot />

{#if $createAttributeArgs.showCreate}
    <CreateAttribute {...$createAttributeArgs} />
{/if}

{#if $showCreateIndex}
    <CreateIndex bind:showCreateIndex={$showCreateIndex} />
{/if}
