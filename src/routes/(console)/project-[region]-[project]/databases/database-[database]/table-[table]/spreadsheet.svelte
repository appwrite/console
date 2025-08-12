<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, Confirm, Id, SortButton } from '$lib/components';
    import { Dependencies, SPREADSHEET_PAGE_LIMIT } from '$lib/constants';
    import { Button as ConsoleButton, InputChoice, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { type Models, Query } from '@appwrite.io/console';
    import { type ComponentType, onDestroy, onMount, tick } from 'svelte';
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
        showCreateIndexSheet,
        type SortState,
        Deletion,
        rowActivitySheet,
        paginatedRows,
        paginatedRowsLoading,
        spreadsheetRenderKey
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
        IconFingerPrint,
        IconHashtag,
        IconLink,
        IconLocationMarker,
        IconMail,
        IconPlus,
        IconRelationship,
        IconText,
        IconToggle,
        IconViewList
    } from '@appwrite.io/pink-icons-svelte';
    import type { HeaderCellAction, RowCellAction } from './sheetOptions.svelte';
    import SheetOptions from './sheetOptions.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import SpreadsheetContainer from './layout/spreadsheet.svelte';
    import EditRowCell from './editRowCell.svelte';
    import { copy } from '$lib/helpers/copy';
    import { writable } from 'svelte/store';
    import { pageToOffset } from '$lib/helpers/load';
    import { debounce } from '$lib/helpers/debounce';
    import { hash } from '$lib/helpers/string';

    export let data: PageData;
    export let showRecordsCreateSheet: {
        show: boolean;
        row: Models.Row | null;
    };

    $: rows = writable(data.rows);
    $: if (rows) {
        paginatedRows.clear();
        paginatedRows.setPage(1, $rows.rows);
    }

    const tableId = page.params.table;
    const databaseId = page.params.database;
    const organizationId = data.organization.$id ?? data.project.teamId;

    const minimumWidth = 168;
    const emptyCellsLimit = $isSmallViewport ? 12 : 18;
    const selected = preferences.getCustomTableColumns(page.params.table);
    const SYSTEM_KEYS = new Set([
        '$tableId',
        '$databaseId'
    ]); /* TODO: should be fixed at the sdk level! */

    let selectedRows = [];
    let displayNames = {};
    let showRelationships = false;
    let relationshipData: Partial<Models.Row>[];
    let selectedRelationship: Models.ColumnRelationship = null;

    let spreadsheetContainer: SpreadsheetContainer;

    let currentPage = 1;
    let jumpToPageReactive = 0;

    let showDelete = false;
    let showColumnDelete = false;
    let deleteConfirmationChecked = false;
    let selectedRowForDelete: Models.Row['$id'] | null = null;

    onMount(async () => {
        displayNames = preferences.getDisplayNames();
        columnsOrder.set(preferences.getColumnOrder(tableId));
        columnsWidth.set(preferences.getColumnWidths(tableId));

        makeTableColumns();
        sortState.set(data.currentSort as SortState);

        if (data.rows.rows.length) {
            paginatedRows.clear();
            paginatedRows.setPage(1, data.rows.rows);
        }
    });

    onDestroy(() => ($showCreateAttributeSheet.show = false));

    function makeTableColumns() {
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
                isPrimary: false,
                hide: !!selected?.includes('$id')
            },
            {
                id: '$createdAt',
                title: 'createdAt',
                width: getColumnWidth('$createdAt', { min: 200 }),
                minimumWidth: 200,
                draggable: true,
                type: 'datetime',
                icon: IconCalendar,
                isEditable: false,
                hide: !!selected?.includes('$createdAt')
            },
            {
                id: '$updatedAt',
                title: 'updatedAt',
                width: getColumnWidth('$updatedAt', { min: 200 }),
                minimumWidth: 200,
                draggable: true,
                type: 'datetime',
                icon: IconCalendar,
                isEditable: false,
                hide: !!selected?.includes('$updatedAt')
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

        const groupedColumns: Column[] = [
            staticColumns[0],
            ...baseColumns,
            staticColumns[1],
            staticColumns[2],
            staticColumns[3]
        ];

        const visibleNonAction = groupedColumns.filter((c) => !c.hide && !c.isAction);
        if (visibleNonAction.length === 1) {
            const only = visibleNonAction[0];
            if (typeof only.width === 'number') {
                only.width = {
                    min: only.width
                };
            }
        }

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

    function getColumnWidth(
        columnId: string,
        defaultWidth: number | { min: number }
    ): number | { min: number; max?: number } {
        const savedWidth = $columnsWidth?.[columnId];
        if (!savedWidth) return defaultWidth;

        return savedWidth.resized;
    }

    function saveColumnsOrder(newOrder: string[], update: boolean = true) {
        if (update) {
            columnsOrder.set(newOrder);
        }

        saveColumnOrderToPreferences(newOrder);
    }

    function saveColumnsWidth({ columnId, newWidth }: { columnId: string; newWidth: number }) {
        const existing = $columnsWidth[columnId];
        const fixed = existing
            ? typeof existing?.fixed === 'number'
                ? existing.fixed
                : existing?.fixed?.min
            : newWidth;

        columnsWidth.update((widths) => ({
            ...widths,
            [columnId]: {
                fixed,
                resized: Math.ceil(newWidth)
            }
        }));

        saveColumnWidthsToPreferences({ columnId, newWidth, fixedWidth: fixed });
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

    async function sort(query: string | null) {
        $spreadsheetLoading = true;

        const url = new URL(page.url);

        if (query === null) {
            url.searchParams.delete('query');
        } else {
            // compatible with `load` func!
            const { attribute, method } = JSON.parse(query);
            url.searchParams.set(
                'query',
                JSON.stringify([
                    [
                        {
                            tag: `${attribute} ${method}`,
                            value: attribute
                        },
                        query
                    ]
                ])
            );
        }

        // trigger ui update with randomized key!
        spreadsheetRenderKey.set(`sorted#${Date.now()}`);

        // save > navigate > restore!
        spreadsheetContainer.saveGridSheetScroll();
        await goto(`${url.pathname}${url.search}`);
        spreadsheetContainer.restoreGridSheetScroll();

        $spreadsheetLoading = false;
    }

    async function handleDelete() {
        showDelete = false;
        try {
            if (selectedRowForDelete) {
                await sdk.forProject(page.params.region, page.params.project).grids.deleteRow({
                    databaseId,
                    tableId,
                    rowId: selectedRowForDelete
                });
            } else {
                if (selectedRows.length) {
                    const batches: string[][] = [];
                    for (let i = 0; i < selectedRows.length; i += 100) {
                        batches.push(selectedRows.slice(i, i + 100));
                    }

                    await Promise.all(
                        batches.map((batch) =>
                            sdk
                                .forProject(page.params.region, page.params.project)
                                .grids.deleteRows({
                                    databaseId,
                                    tableId,
                                    queries: [Query.equal('$id', batch)]
                                })
                        )
                    );
                }
            }

            await invalidate(Dependencies.ROWS);
            trackEvent(Submit.RowDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length ? selectedRows.length : 1} row${selectedRows.length > 1 ? 's' : ''} deleted`
            });

            spreadsheetRenderKey.set(
                hash([
                    data.rows.total.toString(),
                    ...(selectedRows as string[]),
                    selectedRowForDelete
                ])
            );
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.RowDelete);
        } finally {
            selectedRows = [];
            showDelete = false;
            selectedRowForDelete = null;
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

            $databaseColumnSheetOptions.column = null;
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.ColumnDelete);
        } finally {
            showColumnDelete = false;
        }
    }

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
                $showCreateAttributeSheet.title = `Create column to the ${to} of ${neighbour}`;
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
                await sort(Query.orderAsc(columnId));
            } else if (action === 'sort-desc') {
                sortState.set({ column: columnId, direction: 'desc' });
                await sort(Query.orderDesc(columnId));
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
                $databaseRowSheetOptions.title = 'Update row';
            }

            if (action === 'duplicate-row') {
                showRecordsCreateSheet.row = row;
                showRecordsCreateSheet.show = true;
            }

            if (action === 'copy-json') {
                const stringified = JSON.stringify(row, null, 2);
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
                selectedRowForDelete = row.$id;
            }

            if (action === 'activity') {
                $rowActivitySheet.row = row;
                $rowActivitySheet.show = true;
            }
        }
    }

    async function updateRowContents(row: Models.Row) {
        try {
            const onlyData = Object.fromEntries(
                Object.entries(row).filter(([key]) => !SYSTEM_KEYS.has(key))
            );

            await sdk
                .forProject(page.params.region, page.params.project)
                .grids.updateRow(databaseId, tableId, row.$id, onlyData, row.$permissions);

            invalidate(Dependencies.ROW);
            trackEvent(Submit.RowUpdate);
            addNotification({
                message: 'Row has been updated',
                type: 'success'
            });
            return true;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.RowUpdatePermissions);
            return false;
        }
    }

    async function loadPage(pageNumber: number): Promise<boolean> {
        if (pageNumber < 1 || pageNumber > totalPages || $paginatedRows.hasPage(pageNumber)) {
            return false;
        }

        let order = Query.orderDesc('');
        if ($sortState?.column && $sortState?.direction) {
            switch ($sortState.direction) {
                case 'asc':
                    order = Query.orderAsc($sortState.column);
                    break;
                case 'desc':
                    order = Query.orderDesc($sortState.column);
                    break;
                case 'default':
                    order = Query.orderDesc('');
                    break;
            }
        }

        $paginatedRowsLoading = true;
        const loadedRows = await sdk
            .forProject(page.params.region, page.params.project)
            .grids.listRows({
                databaseId,
                tableId,
                queries: [
                    order,
                    Query.limit(SPREADSHEET_PAGE_LIMIT),
                    Query.offset(pageToOffset(pageNumber, SPREADSHEET_PAGE_LIMIT))
                ]
            });

        paginatedRows.setPage(pageNumber, loadedRows.rows);
        $paginatedRowsLoading = false;

        return true;
    }

    async function handleGoToPage(targetPageNum: number): Promise<void> {
        if ($paginatedRows.hasPage(targetPageNum) || $paginatedRows.hasPage(targetPageNum + 1)) {
            scrollToIndexOffset = 0;
        } else {
            scrollToIndexOffset = 16;
        }

        if (targetPageNum < 1 || targetPageNum > totalPages) return;

        if (!$paginatedRows.hasPage(targetPageNum)) {
            paginatedRows.setMaxPage(targetPageNum);
            $paginatedRowsLoading = true;

            const loadedRows = await sdk
                .forProject(page.params.region, page.params.project)
                .grids.listRows({
                    databaseId,
                    tableId,
                    queries: [
                        Query.orderDesc(''),
                        Query.limit(SPREADSHEET_PAGE_LIMIT),
                        Query.offset(pageToOffset(targetPageNum, SPREADSHEET_PAGE_LIMIT))
                    ]
                });

            paginatedRows.setPage(targetPageNum, loadedRows.rows);
            $paginatedRowsLoading = false;
        }
    }

    const saveColumnWidthsToPreferences = debounce(
        (column: { columnId: string; newWidth: number; fixedWidth: number }) => {
            preferences.saveColumnWidths(organizationId, tableId, {
                [column.columnId]: {
                    fixed: column.fixedWidth,
                    resized: Math.ceil(column.newWidth)
                }
            });
        },
        1000
    );

    const saveColumnOrderToPreferences = debounce((newOrder: string[]) => {
        preferences.saveColumnOrder(organizationId, tableId, newOrder);
    }, 1000);

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

    $: emptyCellsCount =
        $paginatedRows.virtualLength >= emptyCellsLimit
            ? 0
            : emptyCellsLimit - $paginatedRows.virtualLength;

    $: canShowDatetimePopover = true;

    $: if ($table.columns) {
        makeTableColumns();
    }

    $: {
        /* up-to-date height */
        tick().then(() => spreadsheetContainer?.resizeSheet());
    }

    $: totalPages = Math.ceil($rows.total / SPREADSHEET_PAGE_LIMIT) || 1;

    $: rowSelection = !$spreadsheetLoading && !$paginatedRowsLoading ? true : ('disabled' as const);

    $: scrollToIndexOffset = 16;
</script>

<SpreadsheetContainer observeExpand bind:this={spreadsheetContainer}>
    {#key $spreadsheetRenderKey}
        <Spreadsheet.Root
            height="100%"
            allowSelection
            useVirtualizer
            keyboardNavigation
            bind:selectedRows
            selection={rowSelection}
            bind:columns={$tableColumns}
            loading={$spreadsheetLoading}
            emptyCells={emptyCellsCount}
            rowCount={$paginatedRows.virtualLength}
            bottomActionClick={() => (showRecordsCreateSheet.show = true)}
            on:columnsSwap={(order) => saveColumnsOrder(order.detail)}
            on:columnsResize={(resize) => saveColumnsWidth(resize.detail)}
            bind:currentPage
            {scrollToIndexOffset}
            nextPageTriggerOffset={2}
            paginationBufferSpace={35}
            jumpToPageNumber={jumpToPageReactive}
            loadingMore={$paginatedRowsLoading}
            itemsPerPage={SPREADSHEET_PAGE_LIMIT}
            loadNextPage={loadPage}
            loadPreviousPage={loadPage}
            goToPage={handleGoToPage}>
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
                                    $showCreateAttributeSheet.title = 'Create column';
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

            <svelte:fragment slot="rows" let:root let:item let:index>
                {@const row = $paginatedRows.getItemAtVirtualIndex(index)}
                {#if row === null}
                    <Spreadsheet.Row.Base
                        {root}
                        virtualItem={item}
                        {index}
                        id={`loading-${index}`}
                        select={rowSelection}>
                        {#each $tableColumns as col}
                            <Spreadsheet.Cell
                                root={{ ...root, loading: true }}
                                column={col.id}
                                id={`loading-${index}-${col.id}`}
                                isEditable={false} />
                        {/each}
                    </Spreadsheet.Row.Base>
                {:else}
                    <Spreadsheet.Row.Base
                        {root}
                        {index}
                        id={row?.$id}
                        virtualItem={item}
                        select={rowSelection}>
                        {#each $tableColumns as { id: columnId, isEditable } (columnId)}
                            {@const rowColumn = $columns.find((col) => col.key === columnId)}
                            <Spreadsheet.Cell {root} {isEditable} column={columnId}>
                                {#if columnId === '$id'}
                                    <Id value={row.$id} tooltipPortal tooltipDelay={200}
                                        >{row.$id}</Id>
                                {:else if columnId === '$createdAt' || columnId === '$updatedAt'}
                                    <DualTimeView
                                        time={row[columnId]}
                                        canShowPopover={canShowDatetimePopover} />
                                {:else if columnId === 'actions'}
                                    <SheetOptions
                                        type="row"
                                        column={rowColumn}
                                        onSelect={(option) =>
                                            onSelectSheetOption(option, null, 'row', row)}
                                        onVisibilityChanged={(visible) => {
                                            canShowDatetimePopover = !visible;
                                        }}>
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
                                {:else if isRelationship(rowColumn)}
                                    {@const args = displayNames?.[rowColumn.relatedTable] ?? [
                                        '$id'
                                    ]}
                                    {#if !isRelationshipToMany(rowColumn)}
                                        {#if row[columnId]}
                                            {@const related = row[columnId]}
                                            <Link.Button
                                                variant="muted"
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // TODO: open sheet maybes
                                                    goto(
                                                        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table/${rowColumn.relatedTable}/row/${related.$id}`
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
                                                selectedRelationship = rowColumn;
                                            }}>
                                            Items
                                        </Button.Button>
                                    {/if}
                                {:else}
                                    {@const value = row[columnId]}
                                    {@const formatted = formatColumn(row[columnId])}
                                    {@const isDatetimeAttribute = rowColumn.type === 'datetime'}
                                    {@const isEncryptedAttribute =
                                        isString(rowColumn) && rowColumn.encrypt}
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
                                        <Tooltip placement="bottom" portal disabled>
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

                                <svelte:fragment slot="cell-editor">
                                    <EditRowCell
                                        column={rowColumn}
                                        row={paginatedRows.items[index]}
                                        onRowStructureUpdate={updateRowContents}
                                        on:change={(row) => paginatedRows.update(index, row.detail)}
                                        on:revert={(row) =>
                                            paginatedRows.update(index, row.detail)} />
                                </svelte:fragment>
                            </Spreadsheet.Cell>
                        {/each}
                    </Spreadsheet.Row.Base>
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="footer">
                <Layout.Stack
                    direction="row"
                    alignContent="center"
                    alignItems="center"
                    justifyContent="space-between">
                    <Layout.Stack
                        gap="l"
                        direction="row"
                        alignItems="center"
                        alignContent="center"
                        inline>
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                            <span style:white-space="nowrap">
                                {selectedRows.length
                                    ? `${selectedRows.length} row${selectedRows.length === 1 ? '' : 's'} selected`
                                    : `${$rows.total} row${$rows.total === 1 ? '' : 's'}`}
                            </span>
                        </Typography.Text>

                        <div
                            style:height="20px"
                            style:width="1px"
                            style:background-color="var(--border-neutral)">
                        </div>

                        <Layout.Stack
                            gap="xs"
                            direction="row"
                            alignItems="center"
                            alignContent="center">
                            <span style:white-space="nowrap"> Page </span>

                            <InputSelect
                                id="pagination"
                                value={currentPage}
                                placeholder="Page"
                                options={Array.from({ length: totalPages }, (_, i) => ({
                                    label: `${i + 1}`,
                                    value: i + 1
                                }))}
                                on:change={(e) => (jumpToPageReactive = Number(e.detail))} />

                            <span style:white-space="nowrap">
                                out of {totalPages}
                            </span>
                        </Layout.Stack>
                    </Layout.Stack>

                    <div style:margin-right="var(--space-6)">
                        <Button.Button
                            variant="extra-compact"
                            on:click={() => {
                                $randomDataModalState.show = true;
                            }}>Generate sample data</Button.Button>
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
    bind:open={showDelete}
    onSubmit={handleDelete}
    title={selectedRows.length === 1 ? 'Delete Row' : 'Delete Rows'}>
    {@const isSingle = selectedRowForDelete !== null}

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
                    <InputChoice
                        id="delete"
                        label="Delete"
                        showLabel={false}
                        bind:value={deleteConfirmationChecked}>
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
        This will permanently remove all data stored in this column across all rows. This action is
        irreversible.
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

    // very weird because the library already has this!
    :global(.virtual-row:has([data-editing-mode='true'])) {
        z-index: 1 !important;
    }

    :global(.floating-editor) {
        & :global(:has(textarea)) {
            left: 0 !important;
            margin-inline-end: 1px;
        }

        /* TODO: not good! */
        & :global(textarea) {
            padding-inline: 9px;
            margin-block: -2.75px;
            min-height: 85px !important;
        }

        /* TODO: not good! */
        & :global(input) {
            padding-inline: 8px !important;
        }

        & :global(.input:focus-within) {
            top: 0 !important;
        }
    }
</style>
