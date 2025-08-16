<script lang="ts" context="module">
    import { writable } from 'svelte/store';
    import type { Option } from './columns/store';

    const createColumnArgs = writable({
        showCreate: false,
        selectedOption: null as Option['name'] | null
    });

    export const initCreateColumn = (option: Option['name']) => {
        createColumnArgs.set({ showCreate: true, selectedOption: option });
    };

    const showCreateIndex = writable(false);
    export const initCreateIndex = () => {
        showCreateIndex.set(true);
    };
</script>

<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { realtime, sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import {
        table,
        columnsOrder,
        databaseColumnSheetOptions,
        databaseRowSheetOptions,
        randomDataModalState,
        showCreateAttributeSheet,
        showCreateIndexSheet,
        spreadsheetLoading,
        rowActivitySheet,
        spreadsheetRenderKey,
        columnsWidth,
        expandTabs
    } from './store';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import CreateColumn from './createColumn.svelte';
    import { CreateColumnPanel } from '$lib/commandCenter/panels';
    import { database } from '../store';
    import { project } from '../../../store';
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { canWriteTables } from '$lib/stores/roles';
    import { IconEye, IconLockClosed, IconPlus, IconPuzzle } from '@appwrite.io/pink-icons-svelte';
    import SideSheet from './layout/sidesheet.svelte';
    import EditRow from './editRow.svelte';
    import EditColumn from './columns/edit.svelte';
    import RowActivity from './rowActivity.svelte';
    import { Dialog, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Button, Seekbar } from '$lib/elements/forms';
    import { generateFakeRecords, generateColumns } from '$lib/helpers/faker';
    import { addNotification } from '$lib/stores/notifications';
    import { sleep } from '$lib/helpers/promises';
    import CreateIndex from './indexes/createIndex.svelte';
    import { hash } from '$lib/helpers/string';
    import { preferences } from '$lib/stores/preferences';

    let editRow: EditRow;
    let createIndex: CreateIndex;
    let createColumn: CreateColumn;
    let selectedOption: Option['name'] = 'String';

    /**
     * adding a lot of fake data will trigger the realtime below
     * and will keep invalidating the `Dependencies.TABLE` making a lot of API noise!
     */
    let isWaterfallFromFaker = false;

    const tableId = page.params.table;

    onMount(() => {
        expandTabs.set(preferences.isTableHeaderExpanded(tableId));

        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe(['project', 'console'], (response) => {
                if (
                    response.events.includes('databases.*.tables.*.columns.*') ||
                    response.events.includes('databases.*.tables.*.indexes.*')
                ) {
                    if (!isWaterfallFromFaker) {
                        invalidate(Dependencies.TABLE);
                    }
                }
            });
    });

    // TODO: use route ids instead of pathname
    $: $registerCommands([
        {
            label: 'Create row',
            keys: page.url.pathname.endsWith($table.$id) ? ['t'] : ['t', 'd'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}/create`
                );
            },
            icon: IconPlus,
            group: 'rows'
        },
        {
            label: 'Create column',
            keys: page.url.pathname.endsWith('columns') ? ['t'] : ['t', 'a'],
            callback() {
                addSubPanel(CreateColumnPanel);
            },
            icon: IconPlus,
            group: 'columns',
            disabled: !$canWriteTables
        },
        {
            label: 'Go to rows',
            keys: ['g', 'd'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}`
                );
            },
            disabled: page.url.pathname.endsWith($table.$id),
            group: 'tables'
        },
        {
            label: 'Go to columns',
            keys: ['g', 'a'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}/columns`
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
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}/indexes`
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
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}/activity`
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
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}/usage`
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
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}/settings`
                );
            },
            disabled: page.url.pathname.endsWith('settings') || !$canWriteTables,
            group: 'tables'
        },
        {
            label: 'Display Name',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/table-${$table.$id}/settings#display-name`
                );
            },
            group: 'tables',
            disabled:
                page.url.pathname.endsWith('display-name') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteTables,
            icon: IconEye
        },
        {
            label: 'Permissions',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/table-${$table.$id}/settings#permissions`
                );
            },
            group: 'tables',
            disabled:
                page.url.pathname.endsWith('permissions') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteTables,
            icon: IconPuzzle
        },
        {
            label: 'Row security',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/table-${$table.$id}/settings#row-security`
                );
            },
            group: 'tables',
            disabled:
                page.url.pathname.endsWith('row-security') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteTables,
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
            disabled: !$canWriteTables
        }
    ]);

    $updateCommandGroupRanks({
        columns: 1000,
        rows: 900,
        tables: 800,
        indexes: 700
    });

    async function createFakeData() {
        isWaterfallFromFaker = true;

        $spreadsheetLoading = true;
        $randomDataModalState.show = false;

        let attributes = $table.columns;
        if (!attributes.length) {
            try {
                attributes = await generateColumns(
                    $project,
                    page.params.database,
                    page.params.table
                );

                await invalidate(Dependencies.TABLE);
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                $spreadsheetLoading = false;
                return;
            }
        }

        /* let the attributes be processed! */
        await sleep(1250);

        let rowIds = [];
        try {
            const { rows, ids } = generateFakeRecords(attributes, $randomDataModalState.value);

            rowIds = ids;

            await sdk.forProject(page.params.region, page.params.project).grids.createRows({
                databaseId: page.params.database,
                tableId: page.params.table,
                rows
            });

            addNotification({
                type: 'success',
                message: 'Sample data added successfully'
            });

            await invalidate(Dependencies.ROWS);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        } finally {
            // reset value to 25 default!
            $randomDataModalState.value = 25;
        }

        /* api is too fast! */
        // await sleep(1250);
        $spreadsheetLoading = false;
        isWaterfallFromFaker = false;

        spreadsheetRenderKey.set(hash(rowIds));
    }
</script>

<svelte:head>
    <title>{$table?.name ?? 'Table'} - Appwrite</title>
</svelte:head>

<slot />

<SideSheet
    spaced
    closeOnBlur
    title={$showCreateAttributeSheet.title}
    bind:show={$showCreateAttributeSheet.show}
    submit={{
        text: 'Create',
        onClick: async () => {
            await createColumn?.submit();
        },
        disabled: !selectedOption
    }}>
    <CreateColumn
        bind:selectedOption
        bind:this={createColumn}
        column={$showCreateAttributeSheet.column}
        showCreate={$showCreateAttributeSheet.show}
        direction={$showCreateAttributeSheet.direction}
        columns={$showCreateAttributeSheet.columns}
        columnsOrder={$showCreateAttributeSheet.columnsOrder}
        onColumnsReorder={(newOrder) => {
            columnsOrder.set(newOrder);
            // columns.set(reorderItems($columns, $columnsOrder));
        }} />
</SideSheet>

<SideSheet
    spaced
    closeOnBlur
    title={$databaseColumnSheetOptions.title}
    bind:show={$databaseColumnSheetOptions.show}
    submit={{
        text: 'Update',
        disabled: $databaseColumnSheetOptions.disableSubmit,
        onClick: () => $databaseColumnSheetOptions.submitAction()
    }}>
    <EditColumn
        isModal={false}
        showEdit={$databaseColumnSheetOptions.isEdit}
        selectedColumn={$databaseColumnSheetOptions.column} />
</SideSheet>

<SideSheet
    spaced
    closeOnBlur
    title={$databaseRowSheetOptions.title}
    bind:show={$databaseRowSheetOptions.show}
    submit={{
        text: 'Update',
        disabled: editRow?.isDisabled(),
        onClick: async () => await editRow?.update()
    }}>
    <EditRow bind:row={$databaseRowSheetOptions.row} bind:this={editRow} />
</SideSheet>

<SideSheet
    spaced
    closeOnBlur
    title="Create index"
    bind:show={$showCreateIndexSheet.show}
    submit={{
        text: 'Create',
        onClick: async () => {
            await createIndex.create();
        }
    }}>
    <CreateIndex
        bind:this={createIndex}
        bind:showCreateIndex={$showCreateIndexSheet.show}
        externalColumnKey={$showCreateIndexSheet.column} />
</SideSheet>

<SideSheet spaced title="Row activity" bind:show={$rowActivitySheet.show} closeOnBlur>
    <RowActivity />
</SideSheet>

<Dialog title="Generate sample data" bind:open={$randomDataModalState.show}>
    <Layout.Stack style="gap: 28px;">
        <Typography.Text>
            Select how many sample rows to generate for testing. This won't delete or replace any
            existing rows.
        </Typography.Text>

        <Seekbar max={100} breakpointCount={5} bind:value={$randomDataModalState.value} />
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => ($randomDataModalState.show = false)}>Cancel</Button>
            <Button on:click={createFakeData}>Create</Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
