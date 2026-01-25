<script lang="ts" context="module">
    import { writable } from 'svelte/store';
    import type { Option } from '$database/table-[table]/columns/store';

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
    import { type RealtimeResponse, realtime, sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import {
        columnsOrder,
        databaseColumnSheetOptions,
        databaseRowSheetOptions,
        showCreateColumnSheet,
        showCreateIndexSheet,
        rowActivitySheet,
        databaseRelatedRowSheetOptions,
        rowPermissionSheet,
        showRowCreateSheet
    } from '$database/table-[table]/store';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import CreateColumn from '$database/table-[table]/createColumn.svelte';
    import { CreateColumnPanel } from '$lib/commandCenter/panels';
    import { project } from '../../../store';
    import { page } from '$app/state';
    import { canWriteTables } from '$lib/stores/roles';
    import {
        IconChevronDown,
        IconChevronUp,
        IconEye,
        IconLockClosed,
        IconPlus,
        IconPuzzle
    } from '@appwrite.io/pink-icons-svelte';
    import {
        CreateIndex,
        EditRecordPermissions,
        RecordActivity,
        SideSheet,
        type Field,
        useTerminology
    } from '$database/(entity)';
    import EditRow from '$database/table-[table]/rows/edit.svelte';
    import EditRelatedRow from '$database/table-[table]/rows/editRelated.svelte';
    import EditColumn from '$database/table-[table]/columns/edit.svelte';
    import { Dialog, Layout, Selector, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { Button, Seekbar } from '$lib/elements/forms';
    import { generateFakeRecords, generateFields } from '$lib/helpers/faker';
    import { addNotification } from '$lib/stores/notifications';
    import { hash } from '$lib/helpers/string';
    import { preferences } from '$lib/stores/preferences';
    import { buildFieldUrl } from '$database/(entity)/helpers/navigation';
    import { isRelationship } from '$database/table-[table]/rows/store';
    import { chunks } from '$lib/helpers/array';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import {
        expandTabs,
        spreadsheetLoading,
        randomDataModalState,
        spreadsheetRenderKey, isWaterfallFromFaker, resetSampleFieldsConfig
    } from '$database/store';

    import type { LayoutData } from './$types';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { showColumnsSuggestionsModal } from '$database/(suggestions)';
    import IndexesSuggestions from '$database/(suggestions)/indexes.svelte';
    import ColumnsSuggestions from '$database/(suggestions)/columns.svelte';
    import { setupColumnObserver } from '$database/(observer)/columnObserver';

    export let data: LayoutData;

    let editRow: EditRow;
    let editRelatedRow: EditRelatedRow;
    let editRecordPermissions: EditRecordPermissions;

    let editRowDisabled = true;
    let editRelatedRowDisabled = true;
    let editRowPermissionsDisabled = true;

    let createIndex: CreateIndex;
    let createColumn: CreateColumn;
    let selectedOption: Option['name'] = 'String';
    let createMoreColumns = false;

    /* terminology */
    const { type: databaseType } = useTerminology(page);

    let columnCreationHandler: ((response: RealtimeResponse) => void) | null = null;

    // manual management of focus is needed!
    const autoFocusAction = (node: HTMLElement, shouldFocus: boolean) => {
        const button = node.querySelector('button');
        if (!button) return;

        const handleBlur = () => button.classList.remove('focus-visible');
        const applyFocus = (focus: boolean) => {
            if (focus) {
                button.classList.add('focus-visible');
                button.focus();
            } else {
                button.classList.remove('focus-visible');
            }
        };

        button.addEventListener('blur', handleBlur);
        applyFocus(shouldFocus);

        return {
            update: applyFocus,
            destroy() {
                button.removeEventListener('blur', handleBlur);
                button.classList.remove('focus-visible');
            }
        };
    };

    $: table = data.table;
    $: basePath = resolveRoute(
        '/(console)/project-[region]-[project]/databases/database-[database]/table-[table]',
        page.params
    );

    onMount(() => {
        expandTabs.set(preferences.getKey('entityHeaderExpanded', true));

        // set faker method.
        $randomDataModalState.onSubmit = async () => await createFakeData();

        return realtime.forProject(page.params.region, ['project', 'console'], (response) => {
            if (
                response.events.includes('databases.*.tables.*.columns.*') ||
                response.events.includes('databases.*.tables.*.indexes.*')
            ) {
                if ($isWaterfallFromFaker) {
                    columnCreationHandler?.(response);
                }
            }
        });
    });

    // TODO: use route ids instead of pathname
    $: $registerCommands([
        {
            label: 'Create row',
            keys: page.url.pathname.endsWith(table?.$id) ? ['r'] : ['r', 'd'],
            callback: () => {
                if (table.fields) {
                    $showRowCreateSheet.show = true;
                }
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
                goto(basePath);
            },
            disabled: page.url.pathname.endsWith(table?.$id),
            group: 'tables'
        },
        {
            label: 'Go to columns',
            keys: ['g', 'a'],
            callback() {
                goto(withPath(basePath, '/columns'));
            },
            disabled: page.url.pathname.endsWith('columns'),
            group: 'tables'
        },
        {
            label: 'Go to indexes',
            keys: ['g', 'i'],
            callback() {
                goto(withPath(basePath, '/indexes'));
            },
            disabled: page.url.pathname.endsWith('indexes'),
            group: 'tables'
        },
        {
            label: 'Go to activity',
            keys: ['g', 'c'],
            callback() {
                goto(withPath(basePath, '/activity'));
            },
            disabled: page.url.pathname.endsWith('activity'),
            group: 'tables'
        },
        {
            label: 'Go to usage',
            keys: ['g', 'u'],
            callback() {
                goto(withPath(basePath, '/usage'));
            },
            disabled: page.url.pathname.endsWith('usage'),
            group: 'tables'
        },
        {
            label: 'Go to settings',
            keys: ['g', 's'],
            callback() {
                goto(withPath(basePath, '/settings'));
            },
            disabled: page.url.pathname.endsWith('settings') || !$canWriteTables,
            group: 'tables'
        },
        {
            label: 'Display Name',
            callback() {
                goto(withPath(basePath, '/settings#display-name'));
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
            callback() {
                goto(withPath(basePath, '/settings#permissions'));
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
            callback() {
                goto(withPath(basePath, '/settings#row-security'));
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

    // TODO: @itznotabug - needs to be fixed!
    async function createFakeData() {
        isWaterfallFromFaker.set(true);

        $spreadsheetLoading = true;
        $randomDataModalState.show = false;

        let columns: Field[] = [];
        const currentFields = table.fields;
        const hasAnyRelationships = currentFields.some((field: Field) => isRelationship(field));
        columns = currentFields.filter((field: Field) => field.type !== 'relationship');

        if (!columns.length) {
            try {
                const {
                    startWaiting,
                    waitPromise,
                    columnCreationHandler: handler
                } = setupColumnObserver();

                columnCreationHandler = handler;

                columns = await generateFields(
                    $project,
                    page.params.database,
                    page.params.table,
                    databaseType
                );

                startWaiting(columns.length);
                await waitPromise;

                await invalidate(Dependencies.TABLE);

                trackEvent(Submit.ColumnCreate, { type: 'faker' });
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                $spreadsheetLoading = false;
                return;
            } finally {
                columnCreationHandler = null;
            }
        } else {
            columns = currentFields;
        }

        let rowIds = [];
        try {
            const { rows, ids } = generateFakeRecords($randomDataModalState.value, columns);

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
            resetSampleFieldsConfig();
        }

        $spreadsheetLoading = false;
        isWaterfallFromFaker.set(false);

        spreadsheetRenderKey.set(hash(rowIds));
    }

    $: if (!$showCreateColumnSheet.show) {
        createMoreColumns = false;
    }

    $: currentRowId = $databaseRowSheetOptions.row?.$id ?? $databaseRowSheetOptions.rowId;
</script>

<svelte:head>
    <title>{table?.name ?? 'Table'} - Appwrite</title>
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
        disabled: editRowDisabled,
        onClick: async () => await editRow?.update()
    }}
    topAction={{
        mode: 'copy-tag',
        text: 'Row URL',
        show: !!currentRowId,
        value: buildFieldUrl('row', currentRowId)
    }}>
    {#snippet topEndActions()}
        {@const rows = $databaseRowSheetOptions.rows ?? []}
        {@const currentIndex = $databaseRowSheetOptions.rowIndex ?? -1}
        {@const isFirstRow = currentIndex <= 0}
        {@const isLastRow = currentIndex >= rows.length - 1}

        {#if !$isTabletViewport}
            {@const shouldFocusPrev = !$databaseRowSheetOptions.autoFocus && !isFirstRow}
            {@const shouldFocusNext =
                !$databaseRowSheetOptions.autoFocus && isFirstRow && !isLastRow}

            <div use:autoFocusAction={shouldFocusPrev} class:nav-button-wrapper={shouldFocusPrev}>
                <Button
                    icon
                    text
                    size="xs"
                    on:click={() => {
                        if (currentIndex > 0) {
                            databaseRowSheetOptions.update((opts) => ({
                                ...opts,
                                row: rows[currentIndex - 1],
                                rowIndex: currentIndex - 1
                            }));
                        }
                    }}
                    disabled={isFirstRow}>
                    <Icon icon={IconChevronUp} />
                </Button>
            </div>

            <div use:autoFocusAction={shouldFocusNext} class:nav-button-wrapper={shouldFocusNext}>
                <Button
                    icon
                    text
                    size="xs"
                    on:click={() => {
                        if (currentIndex < rows.length - 1) {
                            databaseRowSheetOptions.update((opts) => ({
                                ...opts,
                                row: rows[currentIndex + 1],
                                rowIndex: currentIndex + 1
                            }));
                        }
                    }}
                    disabled={isLastRow}>
                    <Icon icon={IconChevronDown} />
                </Button>
            </div>
        {/if}
    {/snippet}

    {#key currentRowId}
        <EditRow
            {table}
            bind:this={editRow}
            bind:row={$databaseRowSheetOptions.row}
            bind:rowId={$databaseRowSheetOptions.rowId}
            bind:disabled={editRowDisabled}
            autoFocus={$databaseRowSheetOptions.autoFocus} />
    {/key}
</SideSheet>

<SideSheet
    closeOnBlur
    title={$databaseRelatedRowSheetOptions.title}
    bind:show={$databaseRelatedRowSheetOptions.show}
    submit={{
        text: 'Update',
        disabled: editRelatedRowDisabled,
        onClick: async () => await editRelatedRow?.update()
    }}>
    <EditRelatedRow
        bind:this={editRelatedRow}
        rows={$databaseRelatedRowSheetOptions.rows}
        tableId={$databaseRelatedRowSheetOptions.tableId}
        bind:disabledState={editRelatedRowDisabled} />
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
        entity={table}
        bind:this={createIndex}
        bind:showCreateIndex={$showCreateIndexSheet.show}
        externalFieldKey={$showCreateIndexSheet.column}
        onCreateIndex={async (index) => {
            await sdk.forProject(page.params.region, page.params.project).tablesDB.createIndex({
                databaseId: page.params.database,
                tableId: page.params.table,
                key: index.key,
                type: index.type,
                columns: index.fields,
                lengths: index.lengths,
                orders: index.orders
            });

            await invalidate(Dependencies.TABLE);
        }} />
</SideSheet>

<SideSheet
    closeOnBlur
    title="Row permissions"
    bind:show={$rowPermissionSheet.show}
    submit={{
        text: 'Update',
        disabled: editRowPermissionsDisabled,
        onClick: async () => editRecordPermissions?.updatePermissions()
    }}>
    <EditRecordPermissions
        entity={table}
        bind:this={editRecordPermissions}
        bind:record={$rowPermissionSheet.row}
        bind:arePermsDisabled={editRowPermissionsDisabled} />
</SideSheet>

<SideSheet title="Row activity" bind:show={$rowActivitySheet.show} closeOnBlur>
    <RecordActivity record={$rowActivitySheet.row} />
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

<IndexesSuggestions {table} />

<style lang="scss">
    // not the best solution but needed!
    .nav-button-wrapper :global(button.focus-visible) {
        outline: var(--border-width-l) solid var(--border-focus);
    }
</style>
