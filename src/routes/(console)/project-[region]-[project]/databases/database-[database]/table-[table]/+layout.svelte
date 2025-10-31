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
        showCreateColumnSheet,
        showCreateIndexSheet,
        spreadsheetLoading,
        rowActivitySheet,
        spreadsheetRenderKey,
        expandTabs,
        databaseRelatedRowSheetOptions,
        rowPermissionSheet,
        type Columns
    } from './store';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import CreateColumn from './createColumn.svelte';
    import { CreateColumnPanel } from '$lib/commandCenter/panels';
    import { database, showCreateTable } from '../store';
    import { project } from '../../../store';
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { canWriteTables } from '$lib/stores/roles';
    import { IconEye, IconLockClosed, IconPlus, IconPuzzle } from '@appwrite.io/pink-icons-svelte';
    import SideSheet from './layout/sidesheet.svelte';
    import EditRow from './rows/edit.svelte';
    import EditRelatedRow from './rows/editRelated.svelte';
    import EditColumn from './columns/edit.svelte';
    import RowActivity from './rows/activity.svelte';
    import EditRowPermissions from './rows/editPermissions.svelte';
    import { Dialog, Layout, Typography, Selector } from '@appwrite.io/pink-svelte';
    import { Button, Seekbar } from '$lib/elements/forms';
    import { generateFakeRecords, generateColumns } from '$lib/helpers/faker';
    import { addNotification } from '$lib/stores/notifications';
    import CreateIndex from './indexes/createIndex.svelte';
    import { hash } from '$lib/helpers/string';
    import { preferences } from '$lib/stores/preferences';
    import { buildRowUrl, isRelationship } from './rows/store';
    import { chunks } from '$lib/helpers/array';
    import { Submit, trackEvent } from '$lib/actions/analytics';

    import IndexesSuggestions from '../(suggestions)/indexes.svelte';
    import ColumnsSuggestions from '../(suggestions)/columns.svelte';
    import {
        showColumnsSuggestionsModal,
        showIndexesSuggestions,
        tableColumnSuggestions
    } from '../(suggestions)';
    import type { RealtimeResponseEvent } from '@appwrite.io/console';

    let editRow: EditRow;
    let editRelatedRow: EditRelatedRow;
    let editRowPermissions: EditRowPermissions;

    let createIndex: CreateIndex;
    let createColumn: CreateColumn;
    let selectedOption: Option['name'] = 'String';
    let createMoreColumns = false;

    /**
     * adding a lot of fake data will trigger the realtime below
     * and will keep invalidating the `Dependencies.TABLE` making a lot of API noise!
     */
    let isWaterfallFromFaker = false;

    let columnCreationHandler: ((response: RealtimeResponseEvent<unknown>) => void) | null = null;

    onMount(() => {
        expandTabs.set(preferences.getKey('tableHeaderExpanded', true));

        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe(['project', 'console'], (response) => {
                if (
                    response.events.includes('databases.*.tables.*.columns.*') ||
                    response.events.includes('databases.*.tables.*.indexes.*')
                ) {
                    if (isWaterfallFromFaker) {
                        columnCreationHandler?.(response);
                    }

                    // don't invalidate when -
                    // 1. from faker
                    // 2. ai columns creation
                    // 3. ai indexes creation
                    if (
                        !isWaterfallFromFaker &&
                        !$showIndexesSuggestions &&
                        !$tableColumnSuggestions.table
                    ) {
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
            callback: () => ($showCreateTable = true),
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

    function setupColumnObserver() {
        let expectedCount = 0;
        let resolvePromise: () => void;
        let timeout: ReturnType<typeof setTimeout>;

        const availableColumns = new Set<string>();
        const waitPromise = new Promise<void>((resolve) => (resolvePromise = resolve));

        columnCreationHandler = (response) => {
            const { events, payload } = response;

            if (
                events.includes('databases.*.tables.*.columns.*.create') ||
                events.includes('databases.*.tables.*.columns.*.update')
            ) {
                const asColumn = payload as Columns;
                const columnId = asColumn.key;
                const status = asColumn.status;

                if (status === 'available') {
                    availableColumns.add(columnId);

                    if (expectedCount > 0 && availableColumns.size >= expectedCount) {
                        clearTimeout(timeout);
                        columnCreationHandler = null;
                        resolvePromise();
                    }
                }
            }
        };

        // return function to start waiting!
        const startWaiting = (count: number) => {
            expectedCount = count;

            timeout = setTimeout(() => {
                columnCreationHandler = null;
                resolvePromise();
            }, 10000);

            if (availableColumns.size >= expectedCount) {
                clearTimeout(timeout);
                columnCreationHandler = null;
                resolvePromise();
            }
        };

        return { startWaiting, waitPromise };
    }

    async function createFakeData() {
        isWaterfallFromFaker = true;

        $spreadsheetLoading = true;
        $randomDataModalState.show = false;

        let columns = page.data.table.columns as Columns[];
        const hasAnyRelationships = columns.some((column) => isRelationship(column));
        const filteredColumns = columns.filter((col) => col.type !== 'relationship');

        if (!filteredColumns.length) {
            try {
                const { startWaiting, waitPromise } = setupColumnObserver();
                columns = await generateColumns($project, page.params.database, page.params.table);
                startWaiting(columns.length);
                await waitPromise;

                await invalidate(Dependencies.TABLE);
                columns = page.data.table.columns as Columns[];

                trackEvent(Submit.ColumnCreate, { type: 'faker' });
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                $spreadsheetLoading = false;
                return;
            }
        }

        let rowIds = [];
        try {
            const { rows, ids } = generateFakeRecords(columns, $randomDataModalState.value);

            rowIds = ids;
            const tablesSDK = sdk.forProject(page.params.region, page.params.project).tablesDB;

            if (hasAnyRelationships) {
                for (const batch of chunks(rows)) {
                    try {
                        await Promise.all(
                            batch.map((row) =>
                                tablesSDK.createRow({
                                    databaseId: page.params.database,
                                    tableId: page.params.table,
                                    rowId: row.$id,
                                    data: row
                                })
                            )
                        );
                    } catch (error) {
                        // ignore, its sample data.
                    }
                }
            } else {
                await tablesSDK.createRows({
                    databaseId: page.params.database,
                    tableId: page.params.table,
                    rows
                });
            }

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

    $: if (!$showCreateColumnSheet.show) {
        createMoreColumns = false;
    }

    $: currentRowId = $databaseRowSheetOptions.row?.$id ?? $databaseRowSheetOptions.rowId;
</script>

<svelte:head>
    <title>{$table?.name ?? 'Table'} - Appwrite</title>
</svelte:head>

<slot />

<SideSheet
    closeOnBlur={false}
    title={$showCreateColumnSheet.title}
    titleBadge={selectedOption === 'Relationship' ? 'Experimental' : undefined}
    bind:show={$showCreateColumnSheet.show}
    submit={{
        text: 'Create',
        onClick: async () => await createColumn?.submit(),
        disabled: !selectedOption
    }}>
    {#snippet footer()}
        <Layout.Stack inline direction="row" alignItems="center">
            <Selector.Switch
                id="create-more-columns"
                bind:checked={createMoreColumns}
                label="Create more" />
        </Layout.Stack>
    {/snippet}
    <CreateColumn
        bind:selectedOption
        bind:this={createColumn}
        bind:createMore={createMoreColumns}
        column={$showCreateColumnSheet.column}
        columns={$showCreateColumnSheet.columns}
        direction={$showCreateColumnSheet.direction}
        columnsOrder={$showCreateColumnSheet.columnsOrder}
        onColumnsReorder={(newOrder) => {
            columnsOrder.set(newOrder);
            // columns.set(reorderItems($columns, $columnsOrder));
        }} />
</SideSheet>

<SideSheet
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
    title={$databaseRowSheetOptions.title}
    bind:show={$databaseRowSheetOptions.show}
    submit={{
        text: 'Update',
        disabled: editRow?.isDisabled(),
        onClick: async () => await editRow?.update()
    }}
    topAction={{
        mode: 'copy-tag',
        text: 'Row URL',
        show: !!currentRowId,
        value: buildRowUrl(currentRowId)
    }}>
    {#key currentRowId}
        <EditRow
            bind:this={editRow}
            bind:row={$databaseRowSheetOptions.row}
            bind:rowId={$databaseRowSheetOptions.rowId} />
    {/key}
</SideSheet>

<SideSheet
    closeOnBlur
    title={$databaseRelatedRowSheetOptions.title}
    bind:show={$databaseRelatedRowSheetOptions.show}
    submit={{
        text: 'Update',
        disabled: editRelatedRow?.isDisabled(),
        onClick: async () => await editRelatedRow?.update()
    }}>
    <EditRelatedRow
        bind:this={editRelatedRow}
        rows={$databaseRelatedRowSheetOptions.rows}
        tableId={$databaseRelatedRowSheetOptions.tableId} />
</SideSheet>

<SideSheet
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

<SideSheet
    closeOnBlur
    title="Row permissions"
    bind:show={$rowPermissionSheet.show}
    submit={{
        text: 'Update',
        disabled: editRowPermissions?.disableSubmit(),
        onClick: async () => editRowPermissions?.updatePermissions()
    }}>
    <EditRowPermissions bind:this={editRowPermissions} bind:row={$rowPermissionSheet.row} />
</SideSheet>

<SideSheet title="Row activity" bind:show={$rowActivitySheet.show} closeOnBlur>
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

<ColumnsSuggestions bind:show={$showColumnsSuggestionsModal} />

<IndexesSuggestions />
