<script lang="ts">
    import { page } from '$app/state';
    import { goto, invalidate } from '$app/navigation';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Confirm, Id, SortButton } from '$lib/components';
    import { Dependencies, SPREADSHEET_PAGE_LIMIT } from '$lib/constants';
    import { Button as ConsoleButton, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { preferences } from '$lib/stores/preferences';
    import { sdk } from '$lib/stores/sdk';
    import { type Models, Query } from '@appwrite.io/console';
    import { type ComponentType, onDestroy, onMount } from 'svelte';
    import type { PageData } from './$types';
    import {
        buildFieldUrl,
        isRelationship,
        isRelationshipToMany,
        isSpatialType,
        isString
    } from './rows/store';
    import {
        columns,
        tableColumns,
        databaseColumnSheetOptions,
        databaseRowSheetOptions,
        sortState,
        showCreateColumnSheet,
        reorderItems,
        columnsOrder,
        columnsWidth,
        showCreateIndexSheet,
        Deletion,
        rowActivitySheet,
        paginatedRows,
        paginatedRowsLoading,
        databaseRelatedRowSheetOptions,
        rowPermissionSheet
    } from './store';
    import type { Column, ColumnType } from '$lib/helpers/types';
    import {
        Alert,
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
        IconArrowSmRight,
        IconCalendar,
        IconDotsHorizontal,
        IconFingerPrint,
        IconHashtag,
        IconLine,
        IconLink,
        IconLocationMarker,
        IconMail,
        IconPoint,
        IconPlus,
        IconPolygon,
        IconRelationship,
        IconSwitchHorizontal,
        IconText,
        IconToggle,
        IconViewList
    } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import {
        type Field,
        SpreadsheetContainer,
        SpreadsheetOptions,
        type HeaderCellAction,
        type RowCellAction
    } from '$database/(entity)';
    import EditRowCell from './rows/cell/edit.svelte';
    import { copy } from '$lib/helpers/copy';
    import { writable } from 'svelte/store';
    import { pageToOffset } from '$lib/helpers/load';
    import { debounce } from '$lib/helpers/debounce';
    import { hash } from '$lib/helpers/string';
    import { formatNumberWithCommas } from '$lib/helpers/numbers';
    import { chunks } from '$lib/helpers/array';
    import { mapToQueryParams } from '$lib/components/filters/store';
    import {
        expandTabs,
        type Columns,
        buildWildcardEntitiesQuery,
        type SortState,
        randomDataModalState,
        spreadsheetLoading,
        spreadsheetRenderKey
    } from '$database/store';

    export let data: PageData;
    export let showRowCreateSheet: {
        show: boolean;
        row: Partial<Models.Row> | null;
    };

    $: table = data.table;
    $: rows = writable(data.rows);
    $: if (rows) {
        paginatedRows.clear();
        paginatedRows.setPage(1, $rows.rows);
    }

    const tableId = page.params.table;
    const databaseId = page.params.database;
    const organizationId = data.organization.$id ?? data.project.teamId;

    const minimumWidth = 168;
    const emptyCellsLimit = $spreadsheetLoading
        ? 30
        : $isSmallViewport
          ? 12
          : $isTabletViewport
            ? 18
            : 24;

    let selectedRows = [];
    let spreadsheetContainer: SpreadsheetContainer;

    let currentPage = 1;
    let jumpToPageReactive = 0;

    let showDelete = false;
    let showColumnDelete = false;
    let selectedRowForDelete: Models.Row['$id'] | null = null;

    onMount(async () => {
        columnsOrder.set(preferences.getColumnOrder(tableId));
        columnsWidth.set(preferences.getColumnWidths(tableId));

        makeTableColumns();
        sortState.set(data.currentSort as SortState);

        if (data.rows.rows.length) {
            paginatedRows.clear();
            paginatedRows.setPage(1, data.rows.rows);
        }

        // rowId exists, we have someone from old url format!
        if ($databaseRowSheetOptions && $databaseRowSheetOptions.rowId) {
            setTimeout(() => ($databaseRowSheetOptions.show = true), 250);
        }
    });

    onDestroy(() => ($showCreateColumnSheet.show = false));

    function makeTableColumns() {
        const selectedColumnsToHide = preferences.getCustomTableColumns(tableId);

        const baseColumns: Column[] = table.fields.map((field: Field) => {
            return {
                id: field.key,
                title: field.key,
                type: field.type as ColumnType,
                hide: !!selectedColumnsToHide?.includes(field.key),
                array: field?.array,
                width: getColumnWidth(field.key, { min: minimumWidth }),
                minimumWidth: minimumWidth,
                draggable: true,
                icon: getAppropriateIcon(field.type),
                format: 'format' in field && field?.format === 'enum' ? field.format : null,
                elements: 'elements' in field ? field.elements : null
            };
        });

        const staticColumns: Column[] = [
            {
                id: '$id',
                title: '$id',
                width: getColumnWidth('$id', 225),
                minimumWidth: 225,
                draggable: false,
                type: 'string',
                icon: IconFingerPrint,
                isEditable: false,
                isPrimary: false,
                hide: !!selectedColumnsToHide?.includes('$id')
            },
            {
                id: '$createdAt',
                title: '$createdAt',
                width: getColumnWidth('$createdAt', { min: 200 }),
                minimumWidth: 200,
                draggable: true,
                type: 'datetime',
                icon: IconCalendar,
                isEditable: false,
                hide: !!selectedColumnsToHide?.includes('$createdAt')
            },
            {
                id: '$updatedAt',
                title: '$updatedAt',
                width: getColumnWidth('$updatedAt', { min: 200 }),
                minimumWidth: 200,
                draggable: true,
                type: 'datetime',
                icon: IconCalendar,
                isEditable: false,
                hide: !!selectedColumnsToHide?.includes('$updatedAt')
            },
            {
                id: 'actions',
                title: '',
                width: 40,
                isAction: true,
                draggable: false,
                type: 'string',
                resizable: false,
                isEditable: false,
                hide: false
            }
        ];

        const groupedColumns: Column[] = [
            staticColumns[0],
            ...baseColumns,
            staticColumns[1],
            staticColumns[2]
        ];

        const actionsColumn = staticColumns[3];

        const reorderedNonActions = reorderItems(groupedColumns, $columnsOrder);
        const finalColumns = [...reorderedNonActions, actionsColumn];

        tableColumns.set(finalColumns);
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
        if (array.length === 0) return 'Empty';

        let formattedFields: string[] = [];
        for (const item of array) {
            formattedFields.push(`${item}`);
        }

        return `${formattedFields.join(', ')}`;
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
            case 'double':
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
            case 'point':
                return IconPoint;
            case 'linestring':
                return IconLine;
            case 'polygon':
                return IconPolygon;
        }
    }

    async function sort(query: string | null) {
        $spreadsheetLoading = true;
        const url = new URL(page.url);
        const parsedQueries = data.parsedQueries;

        if (parsedQueries.size > 0) {
            for (const [tagValue, queryString] of parsedQueries.entries()) {
                if (queryString.includes('orderAsc') || queryString.includes('orderDesc')) {
                    parsedQueries.delete(tagValue);
                }
            }
        }

        if (query !== null) {
            const { attribute, method } = JSON.parse(query);
            const tagValue = {
                tag: `${attribute} ${method}`,
                value: attribute
            };

            parsedQueries.set(tagValue, query);
        }

        if (parsedQueries.size === 0) {
            url.searchParams.delete('query');
        } else {
            url.searchParams.set('query', mapToQueryParams(parsedQueries));
        }

        // save > navigate > restore!
        spreadsheetContainer.saveGridSheetScroll();
        await goto(`${url.pathname}${url.search}`);
        spreadsheetContainer.restoreGridSheetScroll();

        $spreadsheetLoading = false;
    }

    async function handleDelete() {
        showDelete = false;
        let hadErrors = false;

        try {
            if (selectedRowForDelete) {
                await sdk.forProject(page.params.region, page.params.project).tablesDB.deleteRow({
                    databaseId,
                    tableId,
                    rowId: selectedRowForDelete
                });
            } else {
                if (selectedRows.length) {
                    const hasAnyRelationships = table.fields.some(isRelationship) ?? false;

                    const tablesSDK = sdk.forProject(
                        page.params.region,
                        page.params.project
                    ).tablesDB;

                    if (hasAnyRelationships) {
                        for (const batch of chunks(selectedRows)) {
                            try {
                                await Promise.all(
                                    batch.map((rowId) =>
                                        tablesSDK.deleteRow({
                                            databaseId,
                                            tableId,
                                            rowId
                                        })
                                    )
                                );
                            } catch (e) {
                                hadErrors = true;
                                // ignore but keep proceeding!
                            }
                        }

                        if (hadErrors) {
                            addNotification({
                                type: 'error',
                                message: 'Some rows could not be deleted'
                            });
                        }
                    } else {
                        for (const batch of chunks(selectedRows, 100)) {
                            await tablesSDK.deleteRows({
                                databaseId,
                                tableId,
                                queries: [Query.equal('$id', batch)]
                            });
                        }
                    }
                }
            }

            await invalidate(Dependencies.ROWS);
            trackEvent(Click.DatabaseRowDelete);

            if (!hadErrors) {
                // error is already shown above!
                addNotification({
                    type: 'success',
                    message: `${selectedRows.length ? selectedRows.length : 1} row${selectedRows.length > 1 ? 's' : ''} deleted`
                });
            }

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
            await sdk.forProject(page.params.region, page.params.project).tablesDB.deleteColumn({
                databaseId,
                tableId,
                key: $databaseColumnSheetOptions.column.key
            });

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

    function openSideSheetForRelationsToMany(rows: string | Models.Row[], column?: Columns) {
        const relatedCol = column as Models.ColumnRelationship;
        $databaseRelatedRowSheetOptions.rows = rows;
        $databaseRelatedRowSheetOptions.tableId = relatedCol.relatedTable;

        $databaseRelatedRowSheetOptions.show = true;
    }

    async function onSelectSheetOption(
        action: HeaderCellAction | RowCellAction,
        columnId: string,
        column: Columns,
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
                const neighbour = columnId;
                const to = action === 'column-left' ? 'left' : 'right';

                $databaseColumnSheetOptions.column = column;
                $databaseColumnSheetOptions.direction = {
                    neighbour: columnId,
                    to: action === 'column-left' ? 'left' : 'right'
                };

                $showCreateColumnSheet.title = `Create column to the ${to} of ${neighbour}`;
                $showCreateColumnSheet.direction = $databaseColumnSheetOptions.direction;
                $showCreateColumnSheet.columns = $tableColumns;
                $showCreateColumnSheet.columnsOrder = $columnsOrder;
                $showCreateColumnSheet.show = true;
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
                $showCreateColumnSheet.title = `Duplicate column`;
                $showCreateColumnSheet.column = $columns.find((attr) => attr.key === columnId);
                $showCreateColumnSheet.columns = $tableColumns;
                $showCreateColumnSheet.columnsOrder = $columnsOrder;
                $showCreateColumnSheet.show = true;
            }
        } else if (type === 'row') {
            if (action === 'update') {
                $databaseRowSheetOptions.show = true;
                $databaseRowSheetOptions.row = row;
                $databaseRowSheetOptions.title = 'Update row';
            }

            if (action === 'duplicate-row') {
                /**
                 * remove dates because
                 * console can override timestamps!
                 */
                const { $createdAt, $updatedAt, ...rowWithoutDates } = row;

                showRowCreateSheet.row = rowWithoutDates;
                showRowCreateSheet.show = true;
            }

            if (action === 'permissions') {
                $rowPermissionSheet.row = row;
                $rowPermissionSheet.show = true;
            }

            if (action === 'copy-url') {
                try {
                    await copy(buildFieldUrl('row', row.$id));
                    addNotification({
                        type: 'success',
                        message: 'Row url copied'
                    });
                } catch (e) {
                    addNotification({
                        type: 'error',
                        message: e.message
                    });
                }
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
            await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
                databaseId,
                tableId: table.$id,
                rowId: row.$id,
                data: row,
                permissions: row.$permissions
            });

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

    function getCorrectOrderQuery() {
        return $sortState?.column && $sortState?.direction !== 'default'
            ? $sortState.direction === 'asc'
                ? Query.orderAsc($sortState.column)
                : Query.orderDesc($sortState.column)
            : Query.orderDesc('');
    }

    async function loadPage(pageNumber: number): Promise<boolean> {
        if (pageNumber < 1 || pageNumber > totalPages || $paginatedRows.hasPage(pageNumber)) {
            return false;
        }

        const parsedQueries = data.parsedQueries;
        const filterQueries = parsedQueries.size ? data.parsedQueries.values() : [];

        $paginatedRowsLoading = true;
        const loadedRows = await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.listRows({
                databaseId,
                tableId,
                queries: [
                    getCorrectOrderQuery(),
                    Query.limit(SPREADSHEET_PAGE_LIMIT),
                    Query.offset(pageToOffset(pageNumber, SPREADSHEET_PAGE_LIMIT)),
                    ...filterQueries /* filter queries */,
                    ...buildWildcardEntitiesQuery(table)
                ]
            });

        paginatedRows.setPage(pageNumber, loadedRows.rows);
        $paginatedRowsLoading = false;

        return true;
    }

    async function handleGoToPage(targetPageNum: number): Promise<void> {
        jumpToPageReactive = 0;
        if (targetPageNum < 1 || targetPageNum > totalPages) return;

        if (!$paginatedRows.hasPage(targetPageNum)) {
            paginatedRows.setMaxPage(targetPageNum);
            $paginatedRowsLoading = true;

            const loadedRows = await sdk
                .forProject(page.params.region, page.params.project)
                .tablesDB.listRows({
                    databaseId,
                    tableId,
                    queries: [
                        getCorrectOrderQuery(),
                        Query.limit(SPREADSHEET_PAGE_LIMIT),
                        Query.offset(pageToOffset(targetPageNum, SPREADSHEET_PAGE_LIMIT)),
                        ...buildWildcardEntitiesQuery(table)
                    ]
                });

            paginatedRows.setPage(targetPageNum, loadedRows.rows);
            $paginatedRowsLoading = false;
        }
    }

    function getDisplayNamesForTable(relatedTable: string | object | null): string[] {
        if (!relatedTable) return ['$id'];

        let tableId = null;
        if (typeof relatedTable === 'string') {
            tableId = relatedTable;
        } else if (typeof relatedTable === 'object' && 'tableId' in relatedTable) {
            tableId = relatedTable.tableId;
        }

        return preferences.getDisplayNames(tableId) ?? ['$id'];
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
            : emptyCellsLimit - $paginatedRows.virtualLength + (!$expandTabs ? 2 : 0);

    $: canShowDatetimePopover = true;

    $: if (table.fields) {
        makeTableColumns();
    }

    $: totalPages = Math.ceil($rows.total / SPREADSHEET_PAGE_LIMIT) || 1;

    $: rowSelection = !$spreadsheetLoading && !$paginatedRowsLoading ? true : ('disabled' as const);
</script>

<SpreadsheetContainer bind:this={spreadsheetContainer}>
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
            bottomActionClick={() => (showRowCreateSheet.show = true)}
            on:columnsSwap={(order) => saveColumnsOrder(order.detail)}
            on:columnsResize={(resize) => saveColumnsWidth(resize.detail)}
            bind:currentPage
            nextPageTriggerOffset={2}
            jumpToPageNumber={jumpToPageReactive}
            loadingMore={$paginatedRowsLoading}
            itemsPerPage={SPREADSHEET_PAGE_LIMIT}
            loadNextPage={loadPage}
            loadPreviousPage={loadPage}
            goToPage={handleGoToPage}
            bottomActionTooltip={{
                text: 'Create row',
                placement: 'top-end'
            }}>
            <svelte:fragment slot="header" let:root>
                {#each $tableColumns as column (column.id)}
                    {#if column.isAction}
                        <Spreadsheet.Header.Cell column="actions" {root}>
                            <Tooltip>
                                <Button.Button
                                    icon
                                    variant="extra-compact"
                                    on:click={() => {
                                        $showCreateColumnSheet.show = true;
                                        $showCreateColumnSheet.column = null;
                                        $showCreateColumnSheet.title = 'Create column';
                                        $showCreateColumnSheet.columns = $tableColumns;
                                        $showCreateColumnSheet.columnsOrder = $columnsOrder;
                                    }}>
                                    <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                                </Button.Button>

                                <span slot="tooltip"> Create column </span>
                            </Tooltip>
                        </Spreadsheet.Header.Cell>
                    {:else}
                        {@const structureColumn = $columns.find((col) => col.key === column.id)}
                        <SpreadsheetOptions
                            type="header"
                            columnId={column.id}
                            column={structureColumn}
                            onSelect={(option, columnId) =>
                                onSelectSheetOption(option, columnId, structureColumn, 'header')}>
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
                                        alignContent="center"
                                        style="min-width: 0;">
                                        <Typography.Text truncate>
                                            {column.title}
                                        </Typography.Text>

                                        <!-- array indicator -->
                                        {#if column.array}[]{/if}

                                        {#if !isRelationship(structureColumn)}
                                            <SortButton
                                                onSort={sort}
                                                column={column.id}
                                                state={sortState} />
                                        {/if}
                                    </Layout.Stack>
                                </Spreadsheet.Header.Cell>
                            {/snippet}
                        </SpreadsheetOptions>
                    {/if}
                {/each}
            </svelte:fragment>

            <svelte:fragment slot="rows" let:root let:item let:index>
                {@const row = $paginatedRows.getItemAtVirtualIndex(index)}
                {#if row === null}
                    <Spreadsheet.Row.Base
                        {root}
                        {index}
                        virtualItem={item}
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
                        select={rowSelection}
                        showSelectOnHover
                        valueWithoutHover={row.$sequence}>
                        {#each $tableColumns as { id: columnId, isEditable } (columnId)}
                            {@const rowColumn = $columns.find((col) => col.key === columnId)}
                            <Spreadsheet.Cell {root} {isEditable} column={columnId}>
                                {#if columnId === '$id'}
                                    <Id value={row.$id} tooltipPortal tooltipDelay={200}
                                        >{row.$id}</Id>
                                {:else if columnId === '$createdAt' || columnId === '$updatedAt'}
                                    <DualTimeView
                                        showDatetime
                                        time={row[columnId]}
                                        canShowPopover={canShowDatetimePopover} />
                                {:else if columnId === 'actions'}
                                    <SpreadsheetOptions
                                        type="row"
                                        column={rowColumn}
                                        onSelect={(option) =>
                                            onSelectSheetOption(option, null, null, 'row', row)}
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
                                    </SpreadsheetOptions>
                                {:else if isRelationship(rowColumn)}
                                    {@const args = getDisplayNamesForTable(row[columnId])}
                                    {#if !isRelationshipToMany(rowColumn)}
                                        {#if row[columnId]}
                                            {@const displayValue = args
                                                .map((arg) => row[columnId]?.[arg])
                                                .filter(Boolean)
                                                .join(' | ')}

                                            {#if displayValue}
                                                <Link.Button
                                                    variant="muted"
                                                    on:click={() => {
                                                        $databaseRelatedRowSheetOptions.tableId =
                                                            row[columnId]?.['$tableId'];
                                                        $databaseRelatedRowSheetOptions.rows =
                                                            row[columnId]?.['$id'];
                                                        $databaseRelatedRowSheetOptions.show = true;
                                                    }}>
                                                    {displayValue}
                                                </Link.Button>
                                            {:else}
                                                <Badge
                                                    variant="secondary"
                                                    content="NULL"
                                                    size="xs" />
                                            {/if}
                                        {:else}
                                            <Badge variant="secondary" content="NULL" size="xs" />
                                        {/if}
                                    {:else}
                                        {@const itemsNum = row[columnId]?.length}
                                        Items <Badge
                                            content={itemsNum}
                                            variant="secondary"
                                            size="s" />
                                    {/if}
                                {:else if isSpatialType(rowColumn) && row[columnId] !== null}
                                    <Typography.Text truncate>
                                        {JSON.stringify(row[columnId])}
                                    </Typography.Text>
                                {:else}
                                    {@const value = row[columnId]}
                                    {@const formatted = formatColumn(row[columnId])}
                                    {@const isEmptyArray = formatted === 'Empty'}
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
                                    {:else if isEmptyArray}
                                        <Badge variant="secondary" content={formatted} size="xs" />
                                    {:else}
                                        <Typography.Text truncate>
                                            {formatted}
                                        </Typography.Text>
                                    {/if}
                                {/if}

                                <svelte:fragment slot="cell-editor" let:close>
                                    {@const isRelatedToMany = isRelationshipToMany(rowColumn)}
                                    {@const hasItems = isRelatedToMany
                                        ? row[columnId]?.length
                                        : false}

                                    <EditRowCell
                                        {row}
                                        column={rowColumn}
                                        onRowStructureUpdate={updateRowContents}
                                        noInlineEdit={isRelatedToMany && hasItems}
                                        onChange={(row) => paginatedRows.update(index, row)}
                                        onRevert={(row) => paginatedRows.update(index, row)}
                                        openSideSheet={() => {
                                            close(); /* closes the editor */

                                            if (isRelationshipToMany(rowColumn)) {
                                                openSideSheetForRelationsToMany(
                                                    row[columnId],
                                                    rowColumn
                                                );
                                            } else {
                                                onSelectSheetOption(
                                                    'update',
                                                    null,
                                                    null,
                                                    'row',
                                                    row
                                                );
                                            }
                                        }} />
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
                                    : `${formatNumberWithCommas($rows.total)} row${$rows.total === 1 ? '' : 's'}`}
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

                    {#if !$isSmallViewport}
                        <div style:margin-right="var(--space-6)">
                            <Button.Button
                                size="xs"
                                variant="secondary"
                                on:click={() => {
                                    $randomDataModalState.show = true;
                                }}>Generate sample data</Button.Button>
                        </div>
                    {/if}
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

<Confirm
    confirmDeletion
    bind:open={showDelete}
    onSubmit={handleDelete}
    confirmDeletionLabel={relatedColumns?.length
        ? `Delete ${selectedRowForDelete !== null ? 'row' : 'rows'} from ${table.name}`
        : undefined}
    title={selectedRows.length === 1 ? 'Delete Row' : 'Delete Rows'}>
    {@const isSingle = selectedRowForDelete !== null}

    <p>
        {#if isSingle}
            Are you sure you want to delete this row from <b>{table.name}</b>?
        {:else}
            Are you sure you want to delete <b>{selectedRows.length}</b>
            {selectedRows.length > 1 ? 'rows' : 'row'} from <b>{table.name}</b>?
        {/if}
    </p>

    {#if relatedColumns?.length}
        <Table.Root
            let:root
            columns={[
                { id: 'relation', width: 100 },
                { id: 'setting', width: 100 },
                { id: 'description', width: { min: $isSmallViewport ? 300 : 275 } }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="relation" {root}>Relation</Table.Header.Cell>
                <Table.Header.Cell column="setting" {root}>Setting</Table.Header.Cell>
                <Table.Header.Cell column="description" {root}>Description</Table.Header.Cell>
            </svelte:fragment>

            {#each relatedColumns as attr}
                <Table.Row.Base {root}>
                    <Table.Cell column="relation" {root}>
                        <span class="u-flex u-cross-center u-gap-8">
                            {#if attr.twoWay}
                                <Icon icon={IconSwitchHorizontal} size="s" />
                            {:else}
                                <Icon icon={IconArrowSmRight} size="s" />
                            {/if}
                            <span data-private>{attr.key}</span>
                        </span>
                    </Table.Cell>
                    <Table.Cell column="setting" {root}>
                        {attr.onDelete}
                    </Table.Cell>
                    <Table.Cell column="description" {root}>
                        {Deletion[attr.onDelete]}
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>

        <Layout.Stack direction="column" gap="m">
            <Alert.Inline title="To change the selection edit the relationship settings." />
        </Layout.Stack>
    {:else}
        <p class="u-bold">This action is irreversible.</p>
    {/if}
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
        z-index: 3 !important;

        & :global(:has(textarea)) {
            left: 2px !important;
            //margin-inline-end: 1px;
        }

        & :global(textarea) {
            padding-inline: 9px;
            margin-block: -2.75px;
            min-height: 85px !important;
        }

        & :global(:has(.link-wrapper) .input) {
            padding-bottom: 6px !important;
        }

        & :global(:has(.link-wrapper) textarea) {
            min-height: 65px !important;
        }

        & :global(.link-wrapper) {
            padding-inline: 9px;
        }

        & :global(input[type='text']) {
            padding-inline: 8px !important;
        }

        & :global(.input:has([type^='date'])) {
            padding: 12px !important;
        }

        & :global(.input:focus-within) {
            top: 0 !important;
        }
    }
</style>
