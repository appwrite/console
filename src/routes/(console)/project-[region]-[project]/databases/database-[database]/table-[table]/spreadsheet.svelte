<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, Confirm, Id, SortButton } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button as ConsoleButton, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { type Models, Query } from '@appwrite.io/console';
    import { type ComponentType, onDestroy, onMount } from 'svelte';
    import type { PageData } from './$types';
    import { isRelationship, isRelationshipToMany, isString } from './row-[row]/columns/store';
    import {
        columns,
        table,
        tableColumns,
        databaseColumnSheetOptions,
        databaseRowSheetOptions,
        sortState,
        showCreateAttributeSheet,
        reorderItems,
        columnsOrder,
        columnsWidth,
        randomDataModalState,
        spreadsheetLoading,
        showCreateIndexSheet
    } from './store';
    import RelationshipsModal from './relationshipsModal.svelte';
    import type { Column, ColumnType } from '$lib/helpers/types';
    import {
        Tooltip,
        Spreadsheet,
        Table,
        Button,
        Layout,
        Link,
        Badge,
        FloatingActionBar,
        Icon,
        InteractiveText,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import {
        IconCalendar,
        IconDotsHorizontal,
        IconPlus,
        IconRelationship,
        IconFingerPrint,
        IconHashtag,
        IconLink,
        IconLocationMarker,
        IconMail,
        IconText,
        IconToggle,
        IconViewList
    } from '@appwrite.io/pink-icons-svelte';
    import SheetOptions from './sheetOptions.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import SpreadsheetContainer from './layout/spreadsheet.svelte';
    import type { HeaderCellAction, RowCellAction } from './sheetOptions.svelte';
    import { copy } from '$lib/helpers/copy';
    import { debounce } from '$lib/helpers/debounce';

    export let data: PageData;
    export let showRecordsCreateSheet: {
        show: boolean;
        row: Models.Row | null;
    };

    const databaseId = page.params.database;
    const tableId = page.params.table;

    let displayNames = {};
    let showRelationships = false;
    let relationshipData: Partial<Models.Row>[];
    let selectedRelationship: Models.ColumnRelationship = null;

    $: rows = data.rows;

    onMount(async () => {
        displayNames = preferences.getDisplayNames();
        columnsOrder.set(preferences.getColumnOrder(tableId));
        columnsWidth.set(preferences.getColumnWidths(tableId));
    });

    onDestroy(() => ($showCreateAttributeSheet.show = false));

    function saveColumnsOrder(newOrder: string[], update: boolean = true) {
        if (update) {
            columnsOrder.set(newOrder);
        }

        preferences.saveColumnOrder(
            data.organization.$id ?? data.project.teamId,
            tableId,
            newOrder
        );
    }

    function formatArray(array: unknown[]) {
        if (array.length === 0) return '[ ]';

        let formattedFields: string[] = [];
        for (const item of array) {
            if (typeof item === 'string') {
                formattedFields.push(`"${item}"`);
            } else {
                formattedFields.push(`${item}`);
            }
        }

        return `[${formattedFields.join(', ')}]`;
    }

    function formatColumn(column: unknown) {
        let formattedColumn: string;

        if (typeof column === 'string') {
            formattedColumn = column;
        } else if (Array.isArray(column)) {
            formattedColumn = formatArray(column);
        } else if (column === null) {
            formattedColumn = 'null';
        } else {
            formattedColumn = `${column}`;
        }

        return formattedColumn;
    }

    function getAppropriateIcon(type: string): ComponentType {
        switch (type) {
            case 'string':
                return IconText;
            case 'float':
            case 'integer':
                return IconHashtag;
            case 'boolean':
                return IconToggle;
            case 'datetime':
                return IconCalendar;
            case 'email':
                return IconMail;
            case 'ip':
                return IconLocationMarker;
            case 'url':
                return IconLink;
            case 'enum':
                return IconViewList;
            case 'relationship':
                return IconRelationship;
        }
    }

    function getColumnWidth(
        columnId: string,
        defaultWidth: number | { min: number }
    ): number | { min: number; max?: number } {
        const savedWidth = $columnsWidth[columnId];
        if (!savedWidth) return defaultWidth;

        return savedWidth.resized;
    }

    $: selected = preferences.getCustomTableColumns(page.params.table);

    const minimumWidth = 168;
    $: if ($table.columns && $columnsOrder && $columnsWidth) {
        const baseColumns = $table.columns.map((col) => ({
            id: col.key,
            title: col.key,
            type: col.type as ColumnType,
            hide: !!selected?.includes(col.key),
            array: col?.array,
            width: getColumnWidth(col.key, { min: minimumWidth }),
            minimumWidth: minimumWidth,
            draggable: true,
            icon: getAppropriateIcon(col.type),
            format: 'format' in col && col?.format === 'enum' ? col.format : null,
            elements: 'elements' in col ? col.elements : null
        }));

        const staticColumns: Column[] = [
            {
                id: '$id',
                title: 'ID',
                width: getColumnWidth('$id', 225),
                minimumWidth: 225,
                draggable: false,
                type: 'string',
                icon: IconFingerPrint,
                isEditable: false,
                isPrimary: true
            },
            {
                id: '$createdAt',
                title: 'createdAt',
                width: getColumnWidth('$createdAt', { min: 200 }),
                minimumWidth: 200,
                draggable: true,
                type: 'datetime',
                icon: IconCalendar,
                isEditable: false
            },
            {
                id: '$updatedAt',
                title: 'updatedAt',
                width: getColumnWidth('$updatedAt', { min: 200 }),
                minimumWidth: 200,
                draggable: true,
                type: 'datetime',
                icon: IconCalendar,
                isEditable: false
            },
            {
                id: 'actions',
                title: '',
                width: getColumnWidth('actions', 40),
                isAction: true,
                draggable: false,
                type: 'string',
                resizable: false,
                isEditable: false
            }
        ];

        tableColumns.set(
            reorderItems(
                [
                    staticColumns[0],
                    ...baseColumns,
                    staticColumns[1],
                    staticColumns[2],
                    staticColumns[3]
                ],
                $columnsOrder
            )
        );
    }

    let showColumnDelete = false;
    let selectedRows: string[] = [];

    let showDelete = false;
    let selectedDocumentForDelete: Models.Row['$id'] | null = null;

    async function sort(query: string[]) {
        $spreadsheetLoading = true;
        rows = await sdk
            .forProject(page.params.region, page.params.project)
            .grids.listRows(databaseId, tableId, query);
        $spreadsheetLoading = false;
    }

    async function handleDelete() {
        showDelete = false;
        try {
            if (selectedDocumentForDelete) {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .grids.deleteRow(databaseId, tableId, selectedDocumentForDelete);

                selectedDocumentForDelete = null;
            } else {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .grids.deleteRows(databaseId, tableId, [Query.equal('$id', selectedRows)]);
            }

            trackEvent(Submit.RowDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length} document${selectedRows.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.ROWS);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.RowDelete);
        } finally {
            selectedRows = [];
            showDelete = false;
        }
    }

    async function handleColumnDelete() {
        showColumnDelete = false;

        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .grids.deleteColumn(databaseId, tableId, $databaseColumnSheetOptions.column.key);

            if ($columnsOrder.includes($databaseColumnSheetOptions.column.key)) {
                const updatedOrder = $columnsOrder.filter(
                    (id) => id !== $databaseColumnSheetOptions.column.key
                );
                saveColumnsOrder(updatedOrder, false);
            }

            trackEvent(Submit.ColumnDelete);
            addNotification({
                type: 'success',
                message: 'Column deleted'
            });

            invalidate(Dependencies.TABLE);
            invalidate(Dependencies.ROWS);

            $databaseColumnSheetOptions.column = null;
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.ColumnDelete);
        } finally {
            showColumnDelete = false;
        }
    }

    enum Deletion {
        'setNull' = 'Set rpw ID as NULL in all related rows',
        'cascade' = 'All related rows will be deleted',
        'restrict' = 'Row can not be deleted'
    }

    $: relatedColumns = $columns?.filter(
        (attribute) =>
            isRelationship(attribute) &&
            // One-to-One are always included
            (attribute.relationType === 'oneToOne' ||
                // One-to-Many: Only if parent is deleted
                (attribute.relationType === 'oneToMany' && attribute.side === 'parent') ||
                // Many-to-One: Only include if child is deleted
                (attribute.relationType === 'manyToOne' && attribute.side === 'child') ||
                // Many-to-Many: Only include if the parent is being deleted
                (isRelationshipToMany(attribute) && attribute.side === 'parent'))
    ) as Models.ColumnRelationship[];

    let checked = false;

    async function onSelectSheetOption(
        action: HeaderCellAction | RowCellAction,
        columnId: string,
        type: 'header' | 'row',
        row: Models.Row | null = null
    ) {
        if (type === 'header') {
            if (action === 'update') {
                $databaseColumnSheetOptions.show = true;
                $databaseColumnSheetOptions.isEdit = true;
                $databaseColumnSheetOptions.title = 'Update column';
            }

            if (action === 'column-left' || action === 'column-right') {
                const { to, neighbour } = $databaseColumnSheetOptions.direction;
                $showCreateAttributeSheet.title = `Insert column to the ${to} of ${neighbour}`;
                $showCreateAttributeSheet.direction = $databaseColumnSheetOptions.direction;
                $showCreateAttributeSheet.columns = $tableColumns;
                $showCreateAttributeSheet.columnsOrder = $columnsOrder;
                $showCreateAttributeSheet.show = true;
            }

            if (action === 'delete') {
                showColumnDelete = true;
            }

            if (action === 'sort-asc') {
                sortState.set({ column: columnId, direction: 'asc' });
                await sort([Query.orderAsc(columnId)]);
            } else if (action === 'sort-desc') {
                sortState.set({ column: columnId, direction: 'desc' });
                await sort([Query.orderDesc(columnId)]);
            }

            if (action === 'create-index') {
                $showCreateIndexSheet.show = true;
                $showCreateIndexSheet.column = columnId;
            }

            if (action === 'duplicate-header') {
                $showCreateAttributeSheet.title = `Duplicate column`;
                $showCreateAttributeSheet.column = $columns.find((attr) => attr.key === columnId);
                $showCreateAttributeSheet.columns = $tableColumns;
                $showCreateAttributeSheet.columnsOrder = $columnsOrder;
                $showCreateAttributeSheet.show = true;
            }
        } else if (type === 'row') {
            if (action === 'update') {
                $databaseRowSheetOptions.show = true;
                $databaseRowSheetOptions.row = row;
                $databaseRowSheetOptions.title = 'Update record';
            }

            if (action === 'duplicate-row') {
                showRecordsCreateSheet.show = true;
                showRecordsCreateSheet.row = row;
            }

            if (action === 'copy-json') {
                const stringified = JSON.stringify(document, null, 2);
                try {
                    await copy(stringified);
                    addNotification({
                        type: 'success',
                        message: 'Row copied'
                    });
                } catch (e) {
                    addNotification({
                        type: 'error',
                        message: e.message
                    });
                }
            }

            if (action === 'delete') {
                showDelete = true;
                selectedDocumentForDelete = row.$id;
            }
        }
    }

    const emptyCellsLimit = $isSmallViewport ? 12 : 18;

    $: emptyCellsCount =
        data.rows.rows.length >= emptyCellsLimit ? 0 : emptyCellsLimit - data.rows.rows.length;

    const saveColumnsWidth = debounce((column: { columnId: string; newWidth: number }) => {
        const fixedWidth =
            $tableColumns.find((col) => col.id === column.columnId)?.width ?? column.newWidth;

        preferences.saveColumnWidths(data.organization.$id ?? data.project.teamId, tableId, {
            [column.columnId]: {
                fixed: fixedWidth,
                resized: Math.ceil(column.newWidth)
            }
        });
    }, 1000);

    $: reInitSpreadsheetKey = `${$table.columns.length}#${$columnsOrder.length}`;
</script>

<SpreadsheetContainer>
    {#key reInitSpreadsheetKey}
        <Spreadsheet.Root
            let:root
            height="100%"
            allowSelection
            bind:selectedRows
            bind:columns={$tableColumns}
            loading={$spreadsheetLoading}
            emptyCells={emptyCellsCount}
            keyboardNavigation
            bottomActionClick={() => (showRecordsCreateSheet.show = true)}
            on:columnsSwap={(order) => {
                saveColumnsOrder(order.detail);
            }}
            on:columnsResize={(resize) => {
                saveColumnsWidth(resize.detail);
            }}>
            <svelte:fragment slot="header" let:root>
                {#each $tableColumns as column (column.id)}
                    {#if column.isAction}
                        <Spreadsheet.Header.Cell column="actions" {root}>
                            <Button.Button
                                icon
                                variant="extra-compact"
                                on:click={() => {
                                    $showCreateAttributeSheet.show = true;
                                    $showCreateAttributeSheet.column = null;
                                    $showCreateAttributeSheet.columns = $tableColumns;
                                    $showCreateAttributeSheet.title = 'Insert column';
                                    $showCreateAttributeSheet.columnsOrder = $columnsOrder;
                                }}>
                                <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                            </Button.Button>
                        </Spreadsheet.Header.Cell>
                    {:else}
                        <SheetOptions
                            type="header"
                            columnId={column.id}
                            column={$columns.find((col) => col.key === column.id)}
                            onSelect={(option, columnId) =>
                                onSelectSheetOption(option, columnId, 'header')}>
                            {#snippet children(toggle)}
                                <Spreadsheet.Header.Cell
                                    {root}
                                    column={column.id}
                                    icon={column.icon ?? IconText}
                                    on:contextmenu={toggle}>
                                    <Layout.Stack
                                        gap="xs"
                                        direction="row"
                                        alignItems="center"
                                        alignContent="center">
                                        {column.title}

                                        {#if column.isPrimary}
                                            <Badge
                                                content="Primary key"
                                                size="xs"
                                                variant="secondary" />
                                        {/if}

                                        <SortButton
                                            onSort={sort}
                                            column={column.id}
                                            state={sortState} />
                                    </Layout.Stack>
                                </Spreadsheet.Header.Cell>
                            {/snippet}
                        </SheetOptions>
                    {/if}
                {/each}
            </svelte:fragment>

            {#each rows.rows as row, index (row.$id)}
                <!-- TODO: add `value` for user attributes -->
                <Spreadsheet.Row.Base {root} id={row.$id} {index}>
                    {#each $tableColumns as { id: columnId, isEditable } (columnId)}
                        {@const formatted = formatColumn(row[columnId])}
                        <Spreadsheet.Cell
                            {root}
                            {isEditable}
                            column={columnId}
                            value={columnId.includes('$') || formatted === 'null'
                                ? undefined
                                : formatted}>
                            {#if columnId === '$id'}
                                <Id value={row.$id} tooltipPortal>{row.$id}</Id>
                            {:else if columnId === '$createdAt' || columnId === '$updatedAt'}
                                <DualTimeView time={row[columnId]} />
                            {:else if columnId === 'actions'}
                                <SheetOptions
                                    type="row"
                                    column={$columns.find((col) => col.key === columnId)}
                                    onSelect={(option) =>
                                        onSelectSheetOption(option, 'row', null, row)}>
                                    {#snippet children(toggle)}
                                        <Button.Button
                                            icon
                                            variant="extra-compact"
                                            on:click={toggle}>
                                            <Icon
                                                icon={IconDotsHorizontal}
                                                color="--fgcolor-neutral-primary" />
                                        </Button.Button>
                                    {/snippet}
                                </SheetOptions>
                            {:else}
                                {@const col = $columns.find((n) => n.key === columnId)}
                                {#if col}
                                    {#if isRelationship(col)}
                                        {@const args = displayNames?.[col.relatedTable] ?? ['$id']}
                                        {#if !isRelationshipToMany(col)}
                                            {#if row[columnId]}
                                                {@const related = row[columnId]}
                                                <Link.Button
                                                    variant="muted"
                                                    on:click={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // TODO: open sheet maybes
                                                        goto(
                                                            `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table/${col.relatedTable}/row/${related.$id}`
                                                        );
                                                    }}>
                                                    {#each args as arg, i}
                                                        {#if arg !== undefined}
                                                            {#if i}&nbsp;|{/if}
                                                            <span class="text" data-private
                                                                >{related?.[arg]}</span>
                                                        {/if}
                                                    {/each}
                                                </Link.Button>
                                            {:else}
                                                <span class="text">n/a</span>
                                            {/if}
                                        {:else}
                                            {@const itemsNum = row[columnId]?.length}
                                            <Button.Button
                                                variant="extra-compact"
                                                disabled={!itemsNum}
                                                badge={itemsNum ?? 0}
                                                on:click={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    relationshipData = row[columnId];
                                                    showRelationships = true;
                                                    selectedRelationship = col;
                                                }}>
                                                Items
                                            </Button.Button>
                                        {/if}
                                    {:else}
                                        {@const value = row[columnId]}
                                        {@const formatted = formatColumn(row[columnId])}
                                        {@const isDatetimeAttribute = col.type === 'datetime'}
                                        {@const isEncryptedAttribute = isString(col) && col.encrypt}
                                        {#if isDatetimeAttribute}
                                            <DualTimeView time={value}>
                                                <span slot="title">Timestamp</span>
                                                {toLocaleDateTime(value, true)}
                                            </DualTimeView>
                                        {:else if isEncryptedAttribute}
                                            <button on:click={(e) => e.preventDefault()}>
                                                <InteractiveText
                                                    copy={false}
                                                    variant="secret"
                                                    isVisible={false}
                                                    text={formatted} />
                                            </button>
                                        {:else if formatted.length > 20}
                                            <Tooltip placement="bottom" portal>
                                                <Typography.Text truncate>
                                                    {formatted}
                                                </Typography.Text>
                                                <span
                                                    slot="tooltip"
                                                    style:white-space="pre-wrap"
                                                    style:word-break="break-word">
                                                    {formatted}
                                                </span>
                                            </Tooltip>
                                        {:else if formatted === 'null'}
                                            <Badge variant="secondary" content="NULL" size="xs" />
                                        {:else}
                                            <Typography.Text truncate>
                                                {formatted}
                                            </Typography.Text>
                                        {/if}
                                    {/if}
                                {/if}
                            {/if}
                        </Spreadsheet.Cell>
                    {/each}
                </Spreadsheet.Row.Base>
            {/each}

            <svelte:fragment slot="footer">
                <Layout.Stack
                    direction="row"
                    alignContent="center"
                    alignItems="center"
                    justifyContent="space-between">
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                        {selectedRows.length
                            ? `${selectedRows.length} records selected`
                            : `${rows.rows.length} records`}
                    </Typography.Text>

                    <div style:margin-right="var(--space-6)">
                        <Button.Button
                            variant="extra-compact"
                            on:click={() => {
                                $randomDataModalState.show = true;
                            }}>Generate random data</Button.Button>
                    </div>
                </Layout.Stack>
            </svelte:fragment>
        </Spreadsheet.Root>
    {/key}

    {#if selectedRows.length > 0}
        <div class="floating-action-bar">
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <div style:width="max-content">
                        <Layout.Stack direction="row" alignItems="center" gap="m">
                            <Badge content={selectedRows.length.toString()} />
                            <span style:font-size="14px">
                                {selectedRows.length > 1 ? 'rows' : 'row'}
                                selected
                            </span>
                        </Layout.Stack>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <ConsoleButton text on:click={() => (selectedRows = [])}>Cancel</ConsoleButton>
                    <ConsoleButton secondary on:click={() => (showDelete = true)}
                        >Delete</ConsoleButton>
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {/if}
</SpreadsheetContainer>

<RelationshipsModal bind:show={showRelationships} {selectedRelationship} data={relationshipData} />

<Confirm
    title={selectedRows.length === 1 ? 'Delete Row' : 'Delete Rows'}
    bind:open={showDelete}
    onSubmit={handleDelete}>
    {@const isSingle = selectedDocumentForDelete !== null}

    <div>
        {#if isSingle}
            Are you sure you want to delete this document from <b>{$table.name}</b>?
        {:else}
            Are you sure you want to delete <b>{selectedRows.length}</b>
            {selectedRows.length > 1 ? 'rows' : 'row'} from <b>{$table.name}</b>?
        {/if}

        {#if relatedColumns?.length}
            <Table.Root
                let:root
                columns={[
                    { id: 'relation', width: 150 },
                    { id: 'setting', width: 150 },
                    { id: 'desc' }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="relation" {root}>Relation</Table.Header.Cell>
                    <Table.Header.Cell column="setting" {root}>Setting</Table.Header.Cell>
                    <Table.Header.Cell column="desc" {root} />
                </svelte:fragment>
                {#each relatedColumns as attr}
                    <Table.Row.Base {root}>
                        <Table.Cell column="relation" {root}>
                            <span class="u-flex u-cross-center u-gap-8">
                                {#if attr.twoWay}
                                    <span class="icon-switch-horizontal"></span>
                                {:else}
                                    <span class="icon-arrow-sm-right"></span>
                                {/if}
                                <span data-private>{attr.key}</span>
                            </span>
                        </Table.Cell>
                        <Table.Cell column="setting" {root}>
                            {attr.onDelete}
                        </Table.Cell>
                        <Table.Cell column="desc" {root}>
                            {Deletion[attr.onDelete]}
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
            <div class="u-flex u-flex-vertical u-gap-16">
                <Alert>To change the selection edit the relationship settings.</Alert>
                <ul>
                    <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                        Delete {isSingle ? 'document' : 'documents'} from
                        <span data-private>{$table.name}</span>
                    </InputChoice>
                </ul>
            </div>
        {:else}
            <p class="u-bold">This action is irreversible.</p>
        {/if}
    </div>
</Confirm>

<Confirm
    title="Delete column"
    bind:open={showColumnDelete}
    onSubmit={handleColumnDelete}
    confirmDeletion>
    <p>Are you sure you want to delete "<b>{$databaseColumnSheetOptions.column.key}</b>"?</p>

    <p>
        This will permanently remove all data stored in this column across all records. This action
        is irreversible.
    </p>
</Confirm>

<style lang="scss">
    .floating-action-bar {
        left: 50%;
        width: 100%;
        z-index: 14;
        position: absolute;
        transform: translateX(-50%);
    }
</style>
