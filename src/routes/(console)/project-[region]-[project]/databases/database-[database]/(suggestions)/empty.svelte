<script lang="ts">
    import {
        ActionMenu,
        Button,
        Icon,
        Layout,
        Spinner,
        Spreadsheet,
        Typography,
        FloatingActionBar,
        Popover,
        Badge
    } from '@appwrite.io/pink-svelte';
    import { IconFingerPrint, IconPlus, IconText } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import type { Column } from '$lib/helpers/types';
    import { SortButton } from '$lib/components';
    import { expandTabs, columnsOrder, columnsWidth, reorderItems } from '../table-[table]/store';
    import { preferences } from '$lib/stores/preferences';
    import SpreadsheetContainer from '../table-[table]/layout/spreadsheet.svelte';
    import { onDestroy, onMount, tick } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import {
        type ColumnInput,
        mapSuggestedColumns,
        type SuggestedColumnSchema,
        tableColumnSuggestions,
        basicColumnOptions,
        mockSuggestions,
        showIndexesSuggestions
    } from './store';
    import { addNotification, dismissNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { sleep } from '$lib/helpers/promises';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isWithinSafeRange } from '$lib/helpers/numbers';
    import type { Columns } from '../table-[table]/store';
    import { columnOptions } from '../table-[table]/columns/store';
    import Options from './options.svelte';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import { isCloud, VARS } from '$lib/system';
    import { fade } from 'svelte/transition';

    import IconAINotification from './icon/aiNotification.svelte';
    import type { Models } from '@appwrite.io/console';

    let {
        userColumns = [],
        userDataRows = []
    }: {
        userColumns?: Column[];
        userDataRows?: Models.Row[];
    } = $props();

    const tableId = page.params.table;
    const minimumUserColumnWidth = 168;

    function getUserColumnWidth(
        columnId: string,
        defaultWidth: number | { min: number }
    ): number | { min: number; max?: number } {
        const savedWidth = $columnsWidth?.[columnId];
        if (!savedWidth) return defaultWidth;
        return savedWidth.resized;
    }

    // apply order & width to user columns
    const staticUserColumns = $derived.by(() => {
        if (!userColumns.length) return [];

        // apply widths to columns
        const columnsWithWidths = userColumns.map((column) => {
            const defaultWidth =
                typeof column.width === 'object' && 'min' in column.width
                    ? column.width
                    : typeof column.width === 'number'
                      ? column.width
                      : minimumUserColumnWidth;

            return {
                ...column,
                width: getUserColumnWidth(column.id, defaultWidth),
                custom: false,
                resizable: false,
                draggable: false
            };
        });

        // apply ordering if preferences exist
        if ($columnsOrder && $columnsOrder.length > 0) {
            return reorderItems(columnsWithWidths, $columnsOrder);
        }

        return columnsWithWidths.filter(
            (column) => !['$id', '$createdAt', '$updatedAt', 'actions'].includes(column.id)
        );
    });

    let resizeObserver: ResizeObserver;
    let spreadsheetContainer: HTMLElement;

    let hScroller: HTMLElement | null = null;
    let headerElement: HTMLElement | null = null;
    let rangeOverlayEl: HTMLDivElement | null = null;
    let fadeBottomOverlayEl: HTMLDivElement | null = null;
    let snowFadeBottomOverlayEl: HTMLDivElement | null = null;

    let customColumns = $state<SuggestedColumnSchema[]>(
        Array.from({ length: 7 }, (_, index) => createPlaceholderColumn(index))
    );

    let showFloatingBar = $state(true);
    let hasTransitioned = $state(false);
    let scrollAnimationFrame: number | null = null;

    let animation: 'glow' | 'shimmer' | 'both' = 'glow';

    let creatingColumns = $state(false);
    let selectedColumnId = $state<string | null>(null);
    let previousColumnId = $state<string | null>(null);
    let selectedColumnName = $state<string | null>(null);

    let showHeadTooltip = $state(true);
    let isInlineEditing = $state(false);
    // let tooltipTopPosition = $state(50);
    let triggerColumnId = $state<string | null>(null);
    let hoveredColumnId = $state<string | null>(null);

    // for deleting a column + undo
    let undoTimer: ReturnType<typeof setTimeout> | null = $state(null);
    let columnBeingDeleted: (SuggestedColumnSchema & { deletedIndex?: number }) | null =
        $state(null);

    const baseColProps = {
        custom: false,
        draggable: false,
        resizable: false
    };

    const NOTIFICATION_AND_MOCK_DELAY = 1250;
    const COLUMN_DELETION_UNDO_TIMER_LIMIT = 10000; // 10 seconds

    const getColumnWidth = (columnKey: string) => Math.max(180, columnKey.length * 8 + 60);

    const safeNumericValue = (value: number | undefined) =>
        value !== undefined && isWithinSafeRange(value) ? value : undefined;

    const findHorizontalScroller = (root: HTMLElement | null): HTMLElement | null => {
        let element = root as HTMLElement | null;
        while (element && element !== document.body) {
            const computedStyles = getComputedStyle(element);
            if (
                (computedStyles.overflowX === 'auto' || computedStyles.overflowX === 'scroll') &&
                element.scrollWidth > element.clientWidth
            ) {
                return element;
            }

            element = element.parentElement as HTMLElement | null;
        }
        return null;
    };

    const updateOverlayHeight = () => {
        if (!spreadsheetContainer) return;
        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer?.querySelector('[role="rowheader"]');
        }

        if (!headerElement) return;

        const headerRect = headerElement.getBoundingClientRect();
        const containerRect = spreadsheetContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dynamicHeightPx = viewportHeight - headerRect.bottom;
        const overlayTop = Math.round(headerRect.bottom - containerRect.top);
        const overlayHeight = $expandTabs
            ? `${dynamicHeightPx}px`
            : `calc(${dynamicHeightPx}px - 89px)`;

        spreadsheetContainer.style.setProperty('--overlay-top', `${overlayTop}px`);
        spreadsheetContainer.style.setProperty('--overlay-height', overlayHeight);
    };

    const updateOverlayBounds = () => {
        if (!spreadsheetContainer) return;
        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer?.querySelector('[role="rowheader"]');
        }
        if (!headerElement) return;

        // hook the actual horizontal scroller once
        if (!hScroller || !hScroller.isConnected) {
            const previousScrollLeft = hScroller?.scrollLeft || 0;
            hScroller = findHorizontalScroller(headerElement);
            if (hScroller) {
                hScroller.addEventListener('scroll', recalcAllThrottled, { passive: true });
                // Preserve scroll position when reconnecting to scroller
                if (previousScrollLeft > 0) {
                    hScroller.scrollLeft = previousScrollLeft;
                }
            }
        }

        if (rangeOverlayEl) {
            rangeOverlayEl.style.display = 'block';
        }

        // Custom columns mode: calculate precise overlay bounds
        const containerRect = spreadsheetContainer.getBoundingClientRect();
        const getById = (id: string) =>
            headerElement!.querySelector<HTMLElement>(
                `[role="cell"][data-header="true"][data-column-id="${id}"]`
            );

        const hasRealColumns = customColumns.some((col) => !col.isPlaceholder);
        if (!hasRealColumns) {
            // for placeholders or no columns,
            // position overlay to cover custom columns area
            let startCell = getById('$id');

            if (staticUserColumns.length > 0) {
                const lastUserColumn = staticUserColumns[staticUserColumns.length - 1];
                let lastUserCell = getById(lastUserColumn.id);

                // if not found with data-header="true", try without it
                if (!lastUserCell) {
                    lastUserCell = headerElement!.querySelector<HTMLElement>(
                        `[role="cell"][data-column-id="${lastUserColumn.id}"]`
                    );
                }

                if (lastUserCell) {
                    startCell = lastUserCell;
                }
            }

            const actionsCell = headerElement!.querySelector<HTMLElement>(
                '[role="cell"][data-column-id="actions"]'
            );

            if (startCell && actionsCell) {
                const startRect = startCell.getBoundingClientRect();
                const actionsRect = actionsCell.getBoundingClientRect();
                let left = Math.round(startRect.right - containerRect.left);
                const actionsLeft = actionsRect.left - containerRect.left;

                // ensure overlay doesn't go over select
                const selectionRect = spreadsheetContainer
                    .querySelector('[data-select="true"]')
                    ?.getBoundingClientRect();
                if (selectionRect) {
                    const selectionRight = Math.round(selectionRect.right - containerRect.left);
                    left = Math.max(left, selectionRight);
                }

                const width = actionsLeft - left;

                spreadsheetContainer.style.setProperty('--group-left', `${left - 2}px`);
                spreadsheetContainer.style.setProperty('--group-width', `${width + 2}px`);
            } else {
                spreadsheetContainer.style.setProperty('--group-left', '40px');
                spreadsheetContainer.style.setProperty('--group-width', 'calc(100% - 80px)');
            }
            return;
        }

        // Calculate visible viewport bounds
        const scrollerRect = hScroller ? hScroller.getBoundingClientRect() : containerRect;
        const visibleRight = scrollerRect.right;

        // Get start boundary from $id column
        // as its more reliable than first custom column
        const idCell = getById('$id');
        const startCell = getById(customColumns[0]?.key);
        let endCell = getById(customColumns[customColumns.length - 1]?.key);

        // we use a visible end column
        if (endCell) {
            const endRect = endCell.getBoundingClientRect();
            if (endRect.left >= visibleRight) {
                // Find the last column that's at least partially visible
                for (let i = customColumns.length - 2; i >= 0; i--) {
                    const candidateCell = getById(customColumns[i]?.key);
                    if (
                        candidateCell &&
                        candidateCell.getBoundingClientRect().left < visibleRight
                    ) {
                        endCell = candidateCell;
                        break;
                    }
                }
            }
        }

        if (!idCell || !startCell || !endCell) {
            if (rangeOverlayEl) {
                rangeOverlayEl.style.display = 'none';
            }
            return;
        }

        // overlay positioning - start after selection column to avoid covering it
        const idRect = idCell.getBoundingClientRect();
        const selectionRect = spreadsheetContainer
            .querySelector('[data-select="true"]')
            ?.getBoundingClientRect();

        // determine starting point for overlay
        let startLeft = idRect.right;
        if (selectionRect && selectionRect.right > idRect.right) {
            startLeft = selectionRect.right;
        }

        // if userColumns exist,
        // start overlay **after** the last userColumn
        if (staticUserColumns.length > 0) {
            const lastUserColumn = staticUserColumns[staticUserColumns.length - 1];
            const lastUserCell = getById(lastUserColumn.id);

            if (lastUserCell) {
                const lastUserRect = lastUserCell.getBoundingClientRect();
                startLeft = lastUserRect.right;
            }
        }

        if (selectionRect) {
            startLeft = Math.max(startLeft, selectionRect.right);
        }

        const left = Math.round(startLeft - containerRect.left);

        // use the last visible custom column's right edge as the overlay boundary
        const endRect = endCell.getBoundingClientRect();
        const endRight = Math.round(endRect.right - containerRect.left);

        // also get the actions column to ensure we don't exceed it
        const actionsCell = headerElement!.querySelector<HTMLElement>(
            '[role="cell"][data-column-id="actions"]'
        );

        if (!actionsCell) {
            if (rangeOverlayEl) {
                rangeOverlayEl.style.display = 'none';
            }
            return;
        }

        const actionsRect = actionsCell.getBoundingClientRect();
        const actionsLeft = actionsRect.left - containerRect.left;

        // ensure overlay doesn't exceed bounds
        const right = Math.min(endRight, actionsLeft);
        const width = right - left;

        // Apply overlay positioning
        spreadsheetContainer.style.setProperty('--group-left', `${left - 2}px`);
        spreadsheetContainer.style.setProperty('--group-width', `${width + 2}px`);
    };

    // only for mobile, we can remove if not needed!
    const scrollToFirstCustomColumn = () => {
        if (!staticUserColumns.length && !$isSmallViewport) return;

        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer?.querySelector('[role="rowheader"]');
        }

        if (!headerElement) return;

        const directAccessScroller =
            hScroller ??
            findHorizontalScroller(headerElement) ??
            // internal spreadsheet root main container!
            spreadsheetContainer.querySelector('.spreadsheet-container');

        if (!directAccessScroller) return;

        let targetCell: HTMLElement | null = null;

        if (staticUserColumns.length > 0 && !$isSmallViewport) {
            const lastUserColumn = staticUserColumns[staticUserColumns.length - 1];
            targetCell = headerElement.querySelector<HTMLElement>(
                `[role="cell"][data-header="true"][data-column-id="${lastUserColumn.id}"]`
            );
        } else {
            targetCell = headerElement.querySelector<HTMLElement>(
                `[role="cell"][data-header="true"][data-column-id="${customColumns[0]?.key}"]`
            );
        }

        if (targetCell) {
            const cellRect = targetCell.getBoundingClientRect();
            const scrollerRect = directAccessScroller.getBoundingClientRect();
            const scrollLeft =
                directAccessScroller.scrollLeft + cellRect.left - scrollerRect.left - 40;

            directAccessScroller.scrollTo({
                left: Math.max(0, scrollLeft),
                behavior: 'instant'
            });
        }
    };

    function updateColumnHighlight() {
        const activeColumnId = selectedColumnId || hoveredColumnId;
        if (!spreadsheetContainer || !activeColumnId) return;

        const headerCell = spreadsheetContainer.querySelector(
            `[role="rowheader"] [role="cell"][data-column-id="${activeColumnId}"]`
        );

        if (!headerCell) return;

        // calculate position similar to columns-range-overlay logic
        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer.querySelector('[role="rowheader"]');
        }

        if (!headerElement) return;

        const containerRect = spreadsheetContainer.getBoundingClientRect();
        const cellRect = headerCell.getBoundingClientRect();

        const left = Math.round(cellRect.left - containerRect.left);
        const width = cellRect.width;

        const isHovered = !selectedColumnId && hoveredColumnId;
        const isFirstColumn = activeColumnId === customColumns[0]?.key;
        const isLastColumn = activeColumnId === customColumns[customColumns.length - 1]?.key;

        let leftAdjustment = -2;
        let widthAdjustment = 2;
        if (isHovered && (isFirstColumn || isLastColumn)) {
            leftAdjustment = 0;
        }

        // get actions boundary to prevent hover overlay over it
        const actionsCell = headerElement.querySelector<HTMLElement>(
            '[role="cell"][data-column-id="actions"]'
        );

        let finalWidth = width + widthAdjustment;

        if (isHovered && actionsCell) {
            const actionsRect = actionsCell.getBoundingClientRect();
            const actionsLeft = actionsRect.left - containerRect.left;
            const overlayRight = left + leftAdjustment + finalWidth;

            const borderWidth = 2;
            if (overlayRight + borderWidth > actionsLeft) {
                finalWidth = actionsLeft - (left + leftAdjustment) - borderWidth;
            }
        }

        spreadsheetContainer.style.setProperty('--highlight-left', `${left + leftAdjustment}px`);
        spreadsheetContainer.style.setProperty('--highlight-width', `${finalWidth}px`);

        if (isHovered) {
            const tooltipElement =
                spreadsheetContainer.querySelector<HTMLElement>('.custom-tooltip');
            const tooltipWidth = tooltipElement ? tooltipElement.offsetWidth : 200;
            const defaultOffset = 325;
            const smallerOffset = 225;
            const viewportWidth = window.innerWidth;

            // check how much space is available to the right of the column
            const columnRightEdge = left + leftAdjustment + finalWidth;
            const availableSpace = viewportWidth - columnRightEdge;

            // use smaller offset if there isn't enough space for default offset + tooltip
            const shouldUseSmallerOffset = availableSpace < defaultOffset + tooltipWidth;
            const tooltipOffset = shouldUseSmallerOffset ? smallerOffset : defaultOffset;

            spreadsheetContainer.style.setProperty('--tooltip-offset', `${tooltipOffset}px`);
        }
    }

    const recalcAll = () => {
        updateOverlayHeight();
        updateOverlayBounds();
        updateColumnHighlight();
    };

    /**
     * Throttled version of recalcAll for scroll events to improve performance
     */
    const recalcAllThrottled = () => {
        if (scrollAnimationFrame !== null) return;

        scrollAnimationFrame = requestAnimationFrame(() => {
            recalcAll();

            // check if selected column is still visible after scroll
            if (selectedColumnId && !isColumnVisible(selectedColumnId)) {
                resetSelectedColumn();
            }

            if (hoveredColumnId && !isColumnVisible(hoveredColumnId)) {
                hoveredColumnId = null;
            }

            scrollAnimationFrame = null;
        });
    };

    const customSuggestedColumns = $derived.by(() => {
        return customColumns.map((col: SuggestedColumnSchema) => {
            const columnOption = getColumnOption(col.type, col.format);

            return {
                id: col.key,
                title: col.key,
                type: col.type as Column['type'],
                format: col.format,
                required: col.required,
                default: col.default,
                size: col.size,
                min: col.min,
                max: col.max,
                width: { min: getColumnWidth(col.key) },
                icon: columnOption?.icon,
                draggable: false,
                resizable: false,
                custom: true
            };
        });
    });

    const getRowColumns = (): (Column & { custom: boolean })[] => {
        const minColumnWidth = 250;
        const fixedWidths = { id: minColumnWidth, actions: 40, selection: 40 };

        const equalWidthColumns = [...staticUserColumns, ...customSuggestedColumns];

        const totalBaseWidth =
            fixedWidths.id +
            fixedWidths.actions +
            fixedWidths.selection +
            equalWidthColumns.length * minColumnWidth;

        const viewportWidth =
            spreadsheetContainer?.clientWidth ||
            (typeof window !== 'undefined' ? window.innerWidth : totalBaseWidth);

        const excessSpace = Math.max(0, viewportWidth - totalBaseWidth);
        const extraPerColumn =
            equalWidthColumns.length > 0 ? excessSpace / equalWidthColumns.length : 0;
        const distributedWidth = minColumnWidth + extraPerColumn;

        const userColumnsWithWidth = staticUserColumns.map((col) => ({
            ...col,
            width: distributedWidth
        }));

        const finalCustomColumns = customSuggestedColumns.map((col) => ({
            ...col,
            width: { min: distributedWidth }
        }));

        return [
            {
                id: '$id',
                title: '$id',
                type: 'string',
                width: fixedWidths.id,
                icon: IconFingerPrint,
                ...baseColProps
            },
            ...userColumnsWithWidth,
            ...finalCustomColumns,
            {
                id: 'actions',
                title: '',
                type: 'string' as Column['type'],
                width: fixedWidths.actions,
                isAction: true,
                ...baseColProps
            }
        ];
    };

    const spreadsheetColumns = $derived(getRowColumns());
    const emptyCells = $derived(
        ($isSmallViewport ? 14 : 17) + (!$expandTabs ? 2 : 0) - userDataRows.length
    );

    onMount(async () => {
        columnsOrder.set(preferences.getColumnOrder(tableId));
        columnsWidth.set(preferences.getColumnWidths(tableId));

        if (spreadsheetContainer) {
            resizeObserver = new ResizeObserver(recalcAll);
            resizeObserver.observe(spreadsheetContainer);
        }

        requestAnimationFrame(recalcAll);
        await suggestColumns();
    });

    function resetSuggestionsStore(fullReset: boolean = true) {
        if ($tableColumnSuggestions.table?.id !== page.params.table) {
            return;
        }

        if (fullReset) {
            // these are referenced in
            // `table-[table]/+page.svelte`
            $tableColumnSuggestions.table = null;
            $tableColumnSuggestions.force = false;
            $tableColumnSuggestions.enabled = false;
        }

        $tableColumnSuggestions.context = null;
        $tableColumnSuggestions.thinking = false;

        // reset selection!
        resetSelectedColumn();
    }

    async function suggestColumns() {
        $tableColumnSuggestions.thinking = true;

        await tick();
        scrollToFirstCustomColumn();

        let suggestedColumns: {
            total: number;
            columns: ColumnInput[];
        } = {
            total: 0,
            columns: []
        };

        try {
            if (VARS.MOCK_AI_SUGGESTIONS) {
                /* animation */
                await sleep(NOTIFICATION_AND_MOCK_DELAY);
                suggestedColumns = mockSuggestions;
            } else {
                await sleep(5000); // for design review on stage

                suggestedColumns = (await sdk
                    .forProject(page.params.region, page.params.project)
                    .console.suggestColumns({
                        databaseId: page.params.database,
                        tableId: page.params.table,
                        context: $tableColumnSuggestions.context ?? undefined,
                        min: 6
                    })) as unknown as {
                    total: number;
                    columns: ColumnInput[];
                };
            }

            const tableName = $tableColumnSuggestions.table?.name ?? undefined;
            trackEvent(Submit.ColumnSuggestions, {
                tableName,
                total: suggestedColumns.total
            });

            const mappedColumns = mapSuggestedColumns(suggestedColumns.columns);

            // replace with actual columns and trim excess
            if (mappedColumns.length < customColumns.length) {
                customColumns = customColumns.slice(0, mappedColumns.length);
            }

            // replace existing placeholders and
            // add any additional columns if needed
            mappedColumns.forEach((column, index) => {
                setTimeout(() => {
                    if (index < customColumns.length) {
                        // replace existing placeholder
                        customColumns[index] = { ...column, isPlaceholder: false };
                    } else {
                        // new column directly if we have more than expected
                        // just added in case the max ever changes on backend!
                        customColumns.push({ ...column, isPlaceholder: false });
                    }

                    // recalculate overlay bounds
                    // after each column is populated!
                    requestAnimationFrame(() => updateOverlayBounds());
                }, index * 150);
            });

            if (mappedColumns.length > 0) {
                setTimeout(
                    () => {
                        hasTransitioned = true;
                        // final recal after
                        // all animations complete
                        requestAnimationFrame(() => {
                            recalcAll();
                        });
                    },
                    mappedColumns.length * 150 + 300
                );
            }

            resetSuggestionsStore(false);
        } catch (error) {
            // remove completely!
            resetSuggestionsStore();

            // track & notify!
            trackError(error, Submit.ColumnSuggestions);
            addNotification({ type: 'error', message: error.message });
        }
    }

    async function updateOverlaysForMobile(value: boolean) {
        if ($isSmallViewport) {
            setTimeout(() => {
                [rangeOverlayEl, fadeBottomOverlayEl, snowFadeBottomOverlayEl].forEach((el) => {
                    if (el) {
                        el.style.opacity = value ? '0' : '1';
                    }
                });
            }, 0);
        }
    }

    function onPopoverShowStateChanged(value: boolean) {
        showFloatingBar = !value;
        showHeadTooltip = !value;
        updateOverlaysForMobile(value);

        const currentScrollLeft = hScroller?.scrollLeft || 0;

        tick().then(() => {
            if (hScroller) {
                hScroller.scrollLeft = currentScrollLeft;
            }
        });

        // reset selection!
        resetSelectedColumn();
    }

    function updateColumn(columnId: string, updates: Partial<SuggestedColumnSchema>) {
        const columnIndex = customColumns.findIndex((col) => col.key === columnId);
        if (columnIndex !== -1) {
            customColumns[columnIndex] = { ...customColumns[columnIndex], ...updates };
        }
    }

    function getColumn(columnId: string) {
        return customColumns.find((col) => col.key === columnId);
    }

    function getColumnOption(type: string, format?: string | null) {
        return columnOptions.find(
            (option) => option.type === type && (format ? option.format === format : !option.format)
        );
    }

    function isCustomColumn(id: string) {
        return !['$id', '$createdAt', '$updatedAt', 'actions'].includes(id);
    }

    function resetSelectedColumn() {
        selectedColumnId = null;
        previousColumnId = null;
        /*selectedColumnName = null;*/
    }

    // small decor, hides previous cell's right border visibility!
    function handlePreviousColumnsBorder(columnId: string, hide: boolean = true) {
        const allHeaders = Array.from(
            spreadsheetContainer.querySelectorAll(
                '[role="rowheader"] [role="cell"][data-column-id]'
            )
        );

        const selectedIndex = allHeaders.findIndex(
            (cell) => cell.getAttribute('data-column-id') === columnId
        );

        if (selectedIndex > 0) {
            const prevColumnId = allHeaders[selectedIndex - 1].getAttribute('data-column-id');
            if (prevColumnId) {
                const previousCells = spreadsheetContainer.querySelectorAll(
                    `[role="rowheader"] [role="cell"][data-column-id="${prevColumnId}"]`
                );

                previousCells.forEach((cell) => {
                    if (hide) {
                        cell.classList.add('hide-border');
                    } else {
                        cell.classList.remove('hide-border');
                    }
                });
            }
        }
    }

    function isColumnVisible(columnId: string) {
        if (!spreadsheetContainer || !hScroller) return true;

        const columnCell = spreadsheetContainer.querySelector(
            `[role="rowheader"] [role="cell"][data-column-id="${columnId}"]`
        );

        if (!columnCell) return false;

        const cellRect = columnCell.getBoundingClientRect();
        const scrollerRect = hScroller.getBoundingClientRect();

        // stickies have 40px width
        const STICKY_COLUMN_WIDTH = 40;

        // calculate available viewport bounds (excluding both 40px sticky columns)
        const leftBound = scrollerRect.left + STICKY_COLUMN_WIDTH; // Selection column (40px)
        const rightBound = scrollerRect.right - STICKY_COLUMN_WIDTH; // Actions column (40px)

        const safetyMargin = 2;
        return (
            cellRect.left >= leftBound - safetyMargin && cellRect.right <= rightBound + safetyMargin
        );
    }

    function scrollColumnIntoView(columnId: string) {
        if (!spreadsheetContainer || !hScroller) return false;

        const columnCell = spreadsheetContainer.querySelector(
            `[role="rowheader"] [role="cell"][data-column-id="${columnId}"]`
        );

        if (!columnCell) return false;

        const cellRect = columnCell.getBoundingClientRect();
        const scrollerRect = hScroller.getBoundingClientRect();

        // calculate scroll needed to center the column in view
        const scrollLeft =
            hScroller.scrollLeft +
            cellRect.left -
            scrollerRect.left -
            (scrollerRect.width - cellRect.width) / 2;

        hScroller.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
        });

        return true;
    }

    function deleteColumn(columnId: string) {
        if (!columnId) return;

        let columnIndex = -1;
        let columnSchema: SuggestedColumnSchema = null;

        for (let index = 0; index < customColumns.length; index++) {
            if (customColumns[index].key === columnId) {
                columnIndex = index;
                columnSchema = customColumns[index];
                break;
            }
        }

        if (columnIndex === -1 || !columnSchema) {
            return;
        }

        // remove the column
        customColumns.splice(columnIndex, 1);

        // store column with its index for undo
        columnBeingDeleted = { ...columnSchema, deletedIndex: columnIndex };

        // clear any existing timer
        if (undoTimer) {
            clearTimeout(undoTimer);
        }

        // start 10-second undo timer
        undoTimer = setTimeout(() => {
            undoTimer = null;
            selectedColumnId = null;
            columnBeingDeleted = null;
            selectedColumnName = null;
        }, COLUMN_DELETION_UNDO_TIMER_LIMIT);

        // reset selection!
        resetSelectedColumn();

        // see overlay is visible after deletion on mobile!
        setTimeout(() => updateOverlaysForMobile(false), 150);

        // recalculate view after deletion
        requestAnimationFrame(() => recalcAll());
    }

    function undoDelete() {
        if (!columnBeingDeleted) return;

        const { deletedIndex, ...columnData } = columnBeingDeleted;

        // restore column at its original index
        if (deletedIndex !== undefined && deletedIndex >= 0) {
            customColumns.splice(deletedIndex, 0, columnData);
        } else {
            // fallback: add at the end if index is missing
            customColumns.push(columnData);
        }

        // clear undo state
        columnBeingDeleted = null;

        // clear timer
        if (undoTimer) {
            clearTimeout(undoTimer);
            undoTimer = null;
        }

        // recalculate view after restore
        requestAnimationFrame(() => {
            recalcAll();

            tick().then(() => {
                selectedColumnId = columnData.key;
                selectedColumnName = columnData.key;
            });
        });
    }

    function showIndexSuggestionsNotification() {
        // safeguard anyways!
        if (!isCloud) return;

        setTimeout(() => {
            const notifId = addNotification({
                isHtml: true,
                title: '<b>Next step: add indexes</b>',
                message: 'See suggested indexes based on your columns',
                dismissible: true,
                icon: IconAINotification,
                timeout: 10000, // ten seconds
                buttons: [
                    {
                        name: 'Create indexes',
                        method: () => {
                            dismissNotification(notifId);
                            showIndexesSuggestions.update(() => true);
                        }
                    }
                ]
            });
        }, NOTIFICATION_AND_MOCK_DELAY);
    }

    async function createColumns() {
        creatingColumns = true;
        selectedColumnId = null;

        const client = sdk.forProject(page.params.region, page.params.project);

        const isAnyEmpty = customColumns.some((col) => !col.key);
        if (isAnyEmpty) {
            creatingColumns = false;
            addNotification({
                type: 'warning',
                message: 'Some columns have invalid keys'
            });
            return;
        }

        try {
            const results = [];

            for (const column of customColumns) {
                const baseParams = {
                    databaseId: page.params.database,
                    tableId: page.params.table,
                    key: column.key,
                    required: column.required || false,
                    encrypt: 'encrypt' in column ? column.encrypt : undefined
                };

                let columnResult: Columns;
                switch (column.type) {
                    case 'string':
                        if (column.format) {
                            switch (column.format) {
                                case 'email':
                                    columnResult =
                                        await client.tablesDB.createEmailColumn(baseParams);
                                    break;
                                case 'ip':
                                    columnResult = await client.tablesDB.createIpColumn(baseParams);
                                    break;
                                case 'url':
                                    columnResult =
                                        await client.tablesDB.createUrlColumn(baseParams);
                                    break;
                                case 'enum':
                                    columnResult = await client.tablesDB.createEnumColumn({
                                        ...baseParams,
                                        elements: column.elements ?? []
                                    });
                                    break;
                                default:
                                    columnResult = await client.tablesDB.createStringColumn({
                                        ...baseParams,
                                        size: column.size || 255,
                                        xdefault: (column.default as string) || null
                                    });
                                    break;
                            }
                        } else {
                            columnResult = await client.tablesDB.createStringColumn({
                                ...baseParams,
                                size: column.size || 255,
                                xdefault: (column.default as string) || null
                            });
                        }
                        break;

                    case 'integer':
                        columnResult = await client.tablesDB.createIntegerColumn({
                            ...baseParams,
                            min: safeNumericValue(column.min),
                            max: safeNumericValue(column.max),
                            xdefault: (column.default as number) || null
                        });
                        break;

                    case 'double':
                        columnResult = await client.tablesDB.createFloatColumn({
                            ...baseParams,
                            min: safeNumericValue(column.min),
                            max: safeNumericValue(column.max),
                            xdefault: (column.default as number) || null
                        });
                        break;

                    case 'boolean':
                        columnResult = await client.tablesDB.createBooleanColumn({
                            ...baseParams,
                            xdefault: (column.default as boolean) || null
                        });
                        break;

                    case 'datetime':
                        columnResult = await client.tablesDB.createDatetimeColumn({
                            ...baseParams,
                            xdefault: (column.default as string) || null
                        });
                        break;

                    case 'point':
                        columnResult = await client.tablesDB.createPointColumn(baseParams);
                        break;

                    case 'linestring':
                        columnResult = await client.tablesDB.createLineColumn(baseParams);
                        break;

                    case 'polygon':
                        columnResult = await client.tablesDB.createPolygonColumn(baseParams);
                        break;
                }

                results.push(columnResult);
            }

            await invalidate(Dependencies.TABLE);

            addNotification({
                type: 'success',
                message: 'Columns created successfully',
                timeout: NOTIFICATION_AND_MOCK_DELAY
            });

            resetSuggestionsStore(true);

            // show index notification!
            showIndexSuggestionsNotification();

            trackEvent(Submit.ColumnCreate, { type: 'suggestions' });
        } catch (error) {
            trackError(error, Submit.ColumnCreate);
            addNotification({
                type: 'error',
                message: error.message
            });
            creatingColumns = false;
        }
    }

    function createPlaceholderColumn(index: number): SuggestedColumnSchema {
        return {
            key: `column${index + 1}`,
            type: 'string',
            required: false,
            array: false,
            default: null,
            format: null,
            size: undefined,
            min: undefined,
            max: undefined,
            elements: undefined,
            isPlaceholder: true
        };
    }

    // scroll to view if needed and select!
    function selectColumnWithId(column: Column) {
        if (creatingColumns) return;

        const columnId = column.id;
        selectedColumnName = column.title;
        if (!isColumnVisible(columnId)) {
            scrollColumnIntoView(columnId);
            setTimeout(() => (selectedColumnId = columnId), 300);
        } else {
            selectedColumnId = columnId;
        }

        columnBeingDeleted = null;
    }

    /*function fadeSlide(_: Node, { y = 8, duration = 200 } = {}) {
        return {
            duration,
            css: (time: number) => `
                opacity: ${time};
                transform: translateY(${(1 - time) * y}px);
             `
        };
    }*/

    function columnHoverMouseTracker(event: MouseEvent) {
        if (hoveredColumnId && event.target instanceof Element) {
            const hoveredButton = event.target.closest('[data-column-hover]');
            const currentColumnId = hoveredButton?.getAttribute('data-column-hover');

            if (currentColumnId !== hoveredColumnId) {
                hoveredColumnId = null;
            }
        }
    }

    $effect(() => {
        if (!spreadsheetContainer) return;

        // remove existing hide-border classes
        const hiddenCells = spreadsheetContainer.querySelectorAll('[role="cell"].hide-border');
        hiddenCells.forEach((cell) => cell.classList.remove('hide-border'));

        if (!selectedColumnId) return;

        setTimeout(() => {
            // hide borders for selected column and previous column
            const selectedCells = spreadsheetContainer.querySelectorAll(
                `[role="cell"][data-column-id="${selectedColumnId}"]`
            );

            selectedCells.forEach((cell) => cell.classList.add('hide-border'));

            // find and hide previous column's borders (which create the left edge of selected column)
            const allHeaders = Array.from(
                spreadsheetContainer.querySelectorAll(
                    '[role="rowheader"] [role="cell"][data-column-id]'
                )
            );
            const selectedIndex = allHeaders.findIndex(
                (cell) => cell.getAttribute('data-column-id') === selectedColumnId
            );

            if (selectedIndex > 0) {
                const prevColumnId = allHeaders[selectedIndex - 1].getAttribute('data-column-id');
                if (prevColumnId) {
                    const previousCells = spreadsheetContainer.querySelectorAll(
                        `[role="cell"][data-column-id="${prevColumnId}"]`
                    );
                    previousCells.forEach((cell) => cell.classList.add('hide-border'));
                }
            }
        }, 300);

        // update position
        updateColumnHighlight();

        // track for next selection -
        // but only if we had a `real` previous selection
        if (previousColumnId !== null) {
            previousColumnId = selectedColumnId;
        } else {
            // fresh after a deselect
            // set it for future switches
            setTimeout(() => (previousColumnId = selectedColumnId), 25);
        }
    });

    // mark suggested column cells so CSS can target them specifically
    $effect(() => {
        if (!spreadsheetContainer) return;

        // get all custom column IDs
        const suggestedColumnIds = customColumns.map((col) => col.key);
        const firstSuggestedColumnId = suggestedColumnIds[0];

        const columnBeforeOverlay =
            staticUserColumns.length > 0
                ? staticUserColumns[staticUserColumns.length - 1].id
                : '$id';

        const allCells = spreadsheetContainer.querySelectorAll('[role="cell"][data-column-id]');
        allCells.forEach((cell) => {
            const columnId = cell.getAttribute('data-column-id');
            if (columnId && suggestedColumnIds.includes(columnId)) {
                cell.setAttribute('data-suggested-column', 'true');
                if (columnId === firstSuggestedColumnId) {
                    cell.setAttribute('data-first-suggested-column', 'true');
                } else {
                    cell.removeAttribute('data-first-suggested-column');
                }
            } else {
                cell.removeAttribute('data-suggested-column');
                cell.removeAttribute('data-first-suggested-column');
            }

            if (columnId === columnBeforeOverlay) {
                cell.setAttribute('data-column-before-overlay', 'true');
            } else {
                cell.removeAttribute('data-column-before-overlay');
            }
        });
    });

    $effect(() => {
        if (!spreadsheetContainer) return;

        const allCells = spreadsheetContainer.querySelectorAll('[role="cell"]');
        allCells.forEach((cell) => {
            const resizer = cell.querySelector('.column-resizer-disabled') as HTMLDivElement;
            if (resizer) resizer.style.display = '';
        });

        if (!hoveredColumnId) return;

        // auto-scroll if hovered column is out of bounds
        /*if (!isColumnVisible(hoveredColumnId)) {
            scrollColumnIntoView(hoveredColumnId);
        }*/

        const hoveredCells = spreadsheetContainer.querySelectorAll(
            `[role="cell"][data-column-id="${hoveredColumnId}"]`
        );

        hoveredCells.forEach((cell) => {
            const resizer = cell.querySelector('.column-resizer-disabled') as HTMLDivElement;
            if (resizer) resizer.style.display = 'none';
        });

        updateColumnHighlight();
    });

    onDestroy(() => {
        resizeObserver?.disconnect();
        hScroller?.removeEventListener('scroll', recalcAllThrottled);
        if (scrollAnimationFrame) {
            cancelAnimationFrame(scrollAnimationFrame);
        }

        customColumns = [];
        resetSuggestionsStore();
    });
</script>

<svelte:window on:resize={recalcAll} on:scroll={recalcAll} />

<div
    role="none"
    bind:this={spreadsheetContainer}
    class:custom-columns={customColumns.length > 0}
    class:thinking={$tableColumnSuggestions.thinking}
    class="databases-spreadsheet spreadsheet-container-outer"
    style:--overlay-icon-color="#fd366e99"
    style:--non-overlay-icon-color="--fgcolor-neutral-weak"
    onmousemove={columnHoverMouseTracker}>
    <div>
        <div
            aria-hidden="true"
            bind:this={rangeOverlayEl}
            class="columns-range-overlay"
            class:no-transition={hasTransitioned && customColumns.length > 0}
            class:thinking={$tableColumnSuggestions.thinking || creatingColumns}
            data-anim={animation}>
            <div class="ai-border-glow" aria-hidden="true">
                <div class="inner">
                    <div class="bottom-corners"></div>
                </div>
            </div>
        </div>

        <!-- selection border -->
        {#if selectedColumnId || hoveredColumnId}
            {@const activeColumnId = selectedColumnId || hoveredColumnId}
            {@const isHovered = !selectedColumnId && hoveredColumnId}
            {@const isFirstColumn = activeColumnId === customColumns[0]?.key}
            {@const isLastColumn = activeColumnId === customColumns[customColumns.length - 1]?.key}
            <div
                class="column-highlight-overlay"
                class:hover={isHovered}
                class:selected={!isHovered}
                class:last-column={isHovered && isLastColumn}
                class:first-column={isHovered && isFirstColumn}
                class:slide={previousColumnId !== null && !isHovered}
                style:height="100%"
                style:left="var(--highlight-left, 0px)"
                style:width="var(--highlight-width, 0px)"
                out:fade={{ duration: 200 }}>
            </div>

            <!--{@render customTooltip({ text: 'Click to select column', show: isHovered })}-->
        {/if}
    </div>

    <SpreadsheetContainer>
        <Spreadsheet.Root
            allowSelection
            height="100%"
            columns={spreadsheetColumns}
            bottomActionClick={() => {}}
            let:root>
            <svelte:fragment slot="header" let:root>
                {#each spreadsheetColumns as column, index (index)}
                    {#if column.isAction}
                        <Spreadsheet.Header.Cell column="actions" {root}>
                            <Button.Button disabled icon variant="extra-compact">
                                <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                            </Button.Button>
                        </Spreadsheet.Header.Cell>
                    {:else}
                        {@const columnObj = getColumn(column.id)}
                        {@const columnIcon = basicColumnOptions.find(
                            (col) => col.type === columnObj?.type
                        )?.icon}
                        {@const columnIconColor = !columnObj?.type
                            ? '--non-overlay-icon-color'
                            : '--overlay-icon-color'}
                        {@const isColumnInteractable =
                            isCustomColumn(column.id) && columnObj && !columnObj.isPlaceholder}
                        {@const userColumn = column.id === '$id' || !column.custom}

                        {#if userColumn}
                            <Spreadsheet.Header.Cell
                                {root}
                                column={column.id}
                                icon={column.icon ?? IconText}>
                                <Layout.Stack
                                    gap="xs"
                                    direction="row"
                                    alignItems="center"
                                    alignContent="center"
                                    style="min-width: 0;">
                                    <Typography.Text truncate>
                                        {column.title}
                                    </Typography.Text>

                                    <SortButton disabled={true} column={column.id} />
                                </Layout.Stack>
                            </Spreadsheet.Header.Cell>
                        {:else}
                            <Options
                                enabled={isColumnInteractable}
                                headerTooltipText={isColumnInteractable && showHeadTooltip
                                    ? 'Right click for advanced editing'
                                    : undefined}
                                onShowStateChanged={onPopoverShowStateChanged}
                                triggerOpen={() => {
                                    if (triggerColumnId === column.id) {
                                        triggerColumnId = null;
                                        return true;
                                    }

                                    return false;
                                }}>
                                {#snippet children(toggle)}
                                    <Spreadsheet.Header.Cell
                                        {root}
                                        isEditable={isColumnInteractable && !$isTabletViewport}
                                        openEditOnTap={isColumnInteractable && !$isTabletViewport}
                                        column={column.id}
                                        on:contextmenu={(event) => {
                                            // tablet viewport check because context-menu
                                            // can be triggered on long hold clicks as well!
                                            if (isColumnInteractable && !$isTabletViewport) {
                                                toggle(event);
                                            }
                                        }}>
                                        <Layout.Stack
                                            direction="row"
                                            alignItems="center"
                                            alignContent="center"
                                            justifyContent="space-between">
                                            <span
                                                class="column-title"
                                                class:animate-in={!columnObj?.isPlaceholder}
                                                style:--animation-delay={`${isColumnInteractable ? (index - 1) * 100 : 0}ms`}
                                                title={column.title}>
                                                {column.title}
                                            </span>

                                            {@render changeColumnTypePopover({
                                                id: column.id,
                                                columnObj,
                                                iconColor: columnIconColor,
                                                icon: column.icon,
                                                isColumnInteractable,
                                                index
                                            })}
                                        </Layout.Stack>

                                        <svelte:fragment slot="cell-editor">
                                            {#if !$isTabletViewport}
                                                <div
                                                    class="cell-editor"
                                                    onfocusin={() => {
                                                        isInlineEditing = true;
                                                        showHeadTooltip = false;
                                                        resetSelectedColumn();
                                                        handlePreviousColumnsBorder(column.id);
                                                    }}
                                                    onfocusout={() => {
                                                        showHeadTooltip = true;
                                                        isInlineEditing = false;
                                                        handlePreviousColumnsBorder(
                                                            column.id,
                                                            false
                                                        );
                                                    }}>
                                                    <InputText
                                                        id="key"
                                                        autofocus
                                                        required
                                                        bind:value={columnObj.key}
                                                        pattern="^[A-Za-z0-9][A-Za-z0-9._\-]*$">
                                                        <svelte:fragment slot="end">
                                                            {#if columnIcon}
                                                                {@render changeColumnTypePopover({
                                                                    id: column.id,
                                                                    columnObj,
                                                                    iconColor: columnIconColor,
                                                                    icon: column.icon,
                                                                    isColumnInteractable,
                                                                    index
                                                                })}
                                                            {/if}
                                                        </svelte:fragment>
                                                    </InputText>
                                                </div>
                                            {/if}
                                        </svelte:fragment>
                                    </Spreadsheet.Header.Cell>
                                {/snippet}

                                {#snippet tooltipChildren()}
                                    {#if columnObj}
                                        {@const selectedOption = getColumnOption(
                                            columnObj.type,
                                            columnObj.format
                                        )}
                                        {@const ColumnComponent = selectedOption?.component}
                                        <Layout.Stack gap="xl">
                                            <Layout.Stack
                                                direction={$isSmallViewport ? 'column' : 'row'}>
                                                <InputText
                                                    id="key"
                                                    label="Key"
                                                    placeholder="Enter key"
                                                    bind:value={columnObj.key}
                                                    autofocus
                                                    required
                                                    pattern="^[A-Za-z0-9][A-Za-z0-9._\-]*$" />

                                                <InputSelect
                                                    id="type"
                                                    required
                                                    label="Type"
                                                    value={selectedOption?.name || 'String'}
                                                    on:change={(e) => {
                                                        const newOption = columnOptions.find(
                                                            (opt) => opt.name === e.detail
                                                        );
                                                        if (newOption) {
                                                            updateColumn(column.id, {
                                                                type: newOption.type,
                                                                format: newOption.format || null
                                                            });
                                                        }
                                                    }}
                                                    options={basicColumnOptions.map((col) => {
                                                        return {
                                                            label: col.name,
                                                            value: col.name,
                                                            leadingIcon: col.icon
                                                        };
                                                    })} />
                                            </Layout.Stack>

                                            {#if ColumnComponent}
                                                <ColumnComponent
                                                    data={columnObj}
                                                    autoIncreaseSize />
                                            {/if}
                                        </Layout.Stack>
                                    {/if}
                                {/snippet}

                                {#snippet mobileFooterChildren(toggle)}
                                    <Button.Button
                                        size="s"
                                        variant="danger"
                                        on:click={(event) => {
                                            toggle(event);
                                            deleteColumn(column.id);
                                        }}
                                        style="position: absolute; left: 1rem;"
                                        >Delete
                                    </Button.Button>
                                {/snippet}
                            </Options>
                        {/if}
                    {/if}
                {/each}
            </svelte:fragment>

            {#each userDataRows as row}
                <Spreadsheet.Row.Base {root} select="disabled" hoverEffect={false}>
                    {#each spreadsheetColumns as column}
                        {@const columnObj = getColumn(column.id)}
                        {@const interactable =
                            isCustomColumn(column.id) && columnObj && !columnObj.isPlaceholder}
                        <Spreadsheet.Cell {root} column={column.id} isEditable={false}>
                            {@render rowCellInteractiveButton({
                                interactable,
                                column,
                                row
                            })}
                        </Spreadsheet.Cell>
                    {/each}
                </Spreadsheet.Row.Base>
            {/each}

            {#each Array.from({ length: emptyCells }) as _}
                <Spreadsheet.Row.Base {root} select="disabled" hoverEffect={false}>
                    {#each spreadsheetColumns as column}
                        {@const columnObj = getColumn(column.id)}
                        {@const interactable =
                            isCustomColumn(column.id) && columnObj && !columnObj.isPlaceholder}
                        <Spreadsheet.Cell {root} column={column.id} isEditable={false}>
                            {@render rowCellInteractiveButton({
                                interactable,
                                column
                            })}
                        </Spreadsheet.Cell>
                    {/each}
                </Spreadsheet.Row.Base>
            {/each}
        </Spreadsheet.Root>
    </SpreadsheetContainer>

    <div
        bind:this={fadeBottomOverlayEl}
        class="spreadsheet-fade-bottom"
        data-collapsed-tabs={!$expandTabs}>
    </div>

    <div
        bind:this={snowFadeBottomOverlayEl}
        class="snow-fade-bottom"
        data-collapsed-tabs={!$expandTabs}>
    </div>

    {#if $tableColumnSuggestions.thinking}
        <div class="floating-action-wrapper">
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <Layout.Stack direction="row" gap="xxs" alignItems="center">
                        <Spinner size="s" />
                        <Typography.Caption
                            variant="500"
                            color="--fgcolor-neutral-secondary"
                            style="white-space: nowrap">
                            Thinking of column suggestions
                        </Typography.Caption>
                    </Layout.Stack>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <Button.Button
                        size="xs"
                        variant="secondary"
                        on:click={() => resetSuggestionsStore()}
                        >Cancel
                    </Button.Button>
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {:else if customColumns.some((col) => !col.isPlaceholder) && showFloatingBar}
        <!-- undo or delete and cancel sub action -->
        {@const isUndoDeleteMode = columnBeingDeleted && columnBeingDeleted?.key !== null}
        {@const columnName = isUndoDeleteMode ? columnBeingDeleted?.key : selectedColumnName}
        {@const hasSelection = selectedColumnId !== null || isUndoDeleteMode}

        {#if !creatingColumns}
            <div class="floating-action-wrapper expanded" class:selection={hasSelection}>
                <FloatingActionBar>
                    <svelte:fragment slot="start">
                        <Layout.Stack
                            gap="xs"
                            direction="row"
                            alignItems="center"
                            style="padding-bottom: 0;">
                            <Badge
                                size="xs"
                                variant="secondary"
                                content={columnName}
                                type={isUndoDeleteMode ? 'error' : undefined} />

                            <Typography.Caption
                                variant="400"
                                color="--fgcolor-neutral-primary"
                                style="white-space: nowrap;">
                                {#if isUndoDeleteMode}
                                    was deleted. You can undo this action.
                                {:else}
                                    is selected
                                {/if}
                            </Typography.Caption>
                        </Layout.Stack>
                    </svelte:fragment>

                    <svelte:fragment slot="end">
                        <Layout.Stack direction="row" gap="xs" alignItems="center" inline>
                            {#if !isUndoDeleteMode}
                                <Button.Button
                                    size="xs"
                                    variant="text"
                                    on:click={() => (selectedColumnId = null)}>
                                    Cancel
                                </Button.Button>

                                <!--{:else}-->
                                <!--    {@render countdownProgress()}-->
                            {/if}
                            <Button.Button
                                size="xs"
                                variant="secondary"
                                disabled={!isUndoDeleteMode &&
                                    customColumns.filter((col) => !col.isPlaceholder).length <= 1}
                                on:click={() => {
                                    if (isUndoDeleteMode) {
                                        undoDelete();
                                    } else {
                                        deleteColumn(selectedColumnId);
                                    }
                                }}>
                                {#if isUndoDeleteMode}
                                    Undo
                                {:else}
                                    Delete
                                {/if}
                            </Button.Button>
                        </Layout.Stack>
                    </svelte:fragment>
                </FloatingActionBar>
            </div>
        {/if}

        <!-- review columns action -->
        <div
            class="floating-action-wrapper"
            class:expanded={!creatingColumns}
            class:creating-columns={creatingColumns}
            class:has-selection={hasSelection}>
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <Layout.Stack gap="xs" direction="row" alignItems="center">
                        {#if creatingColumns}
                            <Spinner size="s" />
                        {/if}

                        <Typography.Caption
                            variant="500"
                            color="--fgcolor-neutral-secondary"
                            style="white-space: nowrap">
                            {creatingColumns
                                ? 'Creating columns...'
                                : $isSmallViewport
                                  ? 'Click headers or cells to edit columns'
                                  : 'Click headers or cells to edit columns before applying'}
                        </Typography.Caption>
                    </Layout.Stack>
                </svelte:fragment>

                <svelte:fragment slot="end">
                    {#if !creatingColumns}
                        <Layout.Stack direction="row" gap="xs" alignItems="center" inline>
                            <Button.Button
                                size="xs"
                                variant="text"
                                disabled={creatingColumns}
                                on:click={() => {
                                    customColumns = [];
                                    resetSuggestionsStore();
                                }}
                                style="opacity: {creatingColumns ? '0' : '1'}"
                                >Dismiss
                            </Button.Button>
                            <Button.Button
                                size="xs"
                                variant="primary"
                                disabled={creatingColumns}
                                on:click={createColumns}
                                style="opacity: {creatingColumns ? '0' : '1'}"
                                >Apply
                            </Button.Button>
                        </Layout.Stack>
                    {/if}
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {/if}
</div>

<!--{#snippet customTooltip({ text, show })}
    <div
        transition:fadeSlide
        class="custom-tooltip"
        style:top={`${tooltipTopPosition}%`}
        class:show-tooltip={show && !$isTabletViewport}>
        <Typography.Text>
            {text}
        </Typography.Text>
    </div>
{/snippet}-->

{#snippet rowCellInteractiveButton({ interactable, column, row = null })}
    <button
        class="column-selector-button"
        aria-label="Select column"
        style:cursor={column.custom ? 'pointer' : 'default'}
        data-column-hover={column.id}
        onmouseenter={() => {
            if (
                interactable &&
                !selectedColumnId &&
                !isInlineEditing &&
                !$isTabletViewport &&
                !$isSmallViewport &&
                !$tableColumnSuggestions.thinking &&
                !creatingColumns &&
                hoveredColumnId !== column.id
            ) {
                hoveredColumnId = column.id;
                /*tooltipTopPosition = 35 + Math.random() * 20;*/
            }
        }}
        onclick={() => {
            if (interactable) {
                if (!$isTabletViewport) {
                    selectColumnWithId(column);
                } else if ($isSmallViewport) {
                    triggerColumnId = column.id;
                }
            }
        }}>
        {#if !column.custom && row}
            <span class="u-trim fake-cell">{row[column.id] ?? ''}</span>
        {/if}
    </button>
{/snippet}

{#snippet changeColumnTypePopover({ id, columnObj, iconColor, icon, isColumnInteractable, index })}
    <Popover let:toggle portal padding="none" placement="bottom-start">
        <div
            class="column-icon-wrapper"
            class:animate-in={!columnObj?.isPlaceholder}
            style:--animation-delay={`${isColumnInteractable ? (index - 1) * 100 : 0}ms`}>
            <Button.Button
                size="xs"
                variant="extra-compact"
                disabled={!isColumnInteractable}
                on:click={(event) => {
                    if (isColumnInteractable && !$isTabletViewport) {
                        toggle(event);
                        resetSelectedColumn();
                    }
                }}>
                {#if !columnObj?.isPlaceholder}
                    <Icon size="s" color={iconColor ?? undefined} icon={icon ?? undefined} />
                {/if}
            </Button.Button>
        </div>

        <div let:toggle slot="tooltip" class="actions-menu-wrapper">
            <ActionMenu.Root width="228px">
                <Layout.Stack
                    gap="none"
                    direction="column"
                    class="filter-modal-actions-menu variant">
                    {#each basicColumnOptions as option}
                        <ActionMenu.Item.Button
                            on:click={() => {
                                toggle();
                                updateColumn(id, {
                                    type: option.type,
                                    format: option.format || null
                                });
                            }}>
                            <Layout.Stack gap="s" direction="row" alignContent="center">
                                <Icon icon={option.icon} />
                                {option.name}
                            </Layout.Stack>
                        </ActionMenu.Item.Button>
                    {/each}
                </Layout.Stack>
            </ActionMenu.Root>
        </div>
    </Popover>
{/snippet}

<!--{#snippet countdownProgress()}-->
<!--    {@const COUNTDOWN_DURATION = 10000}-->

<!--    <div class="countdown-wrapper" style="padding-bottom: 0;">-->
<!--        <svg-->
<!--            xmlns="http://www.w3.org/2000/svg"-->
<!--            width={`var(&#45;&#45;icon-size-s)`}-->
<!--            height={`var(&#45;&#45;icon-size-s)`}-->
<!--            viewBox="0 0 24 24"-->
<!--            fill="none"-->
<!--            style="transform: rotate(-90deg)">-->
<!--            &lt;!&ndash; Background circle &ndash;&gt;-->
<!--            <path-->
<!--                opacity="0.2"-->
<!--                d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM2.4 12C2.4 17.3019 6.69807 21.6 12 21.6C17.3019 21.6 21.6 17.3019 21.6 12C21.6 6.69807 17.3019 2.4 12 2.4C6.69807 2.4 2.4 6.69807 2.4 12Z"-->
<!--                fill="#56565C" />-->
<!--            &lt;!&ndash; Progress circle &ndash;&gt;-->
<!--            <circle-->
<!--                cx="12"-->
<!--                cy="12"-->
<!--                r="10.8"-->
<!--                fill="none"-->
<!--                stroke="#56565C"-->
<!--                stroke-width="2.4"-->
<!--                stroke-dasharray="67.858"-->
<!--                stroke-dashoffset="0"-->
<!--                class="countdown-circle"-->
<!--                style="animation-duration: {COUNTDOWN_DURATION}ms" />-->
<!--        </svg>-->
<!--    </div>-->
<!--{/snippet}-->

<style lang="scss">
    .spreadsheet-container-outer {
        width: 100%;
        position: fixed;
        overflow: visible;
        scrollbar-width: none;

        --columns-range-pink-border-color: rgba(253, 54, 110, 0.18);
        --columns-range-pink-header-background-color: rgba(253, 54, 110, 0.12);

        &.custom-columns {
            width: unset;
        }

        & :global([role='rowheader'] :nth-last-child(2) [role='presentation']) {
            display: none;
        }

        &:has(.columns-range-overlay) {
            :global([role='rowheader'][data-suggested-column='true']) {
                background: var(--columns-range-pink-header-background-color);
            }

            :global([role='cell']:has(.column-resizer-disabled)[data-suggested-column='true']) {
                box-shadow: 0 -1px 0 0 var(--columns-range-pink-border-color) inset !important;
                transition: box-shadow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            :global(
                [role='cell']:not([data-column-id='actions'])[data-suggested-column='true']
                    .column-resizer-disabled
            ) {
                border-left: var(--border-width-s, 1px) solid var(--columns-range-pink-border-color) !important;
                transition: border-color 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            :global([role='cell'][data-column-before-overlay='true'] .column-resizer-disabled) {
                opacity: 0 !important;
            }

            :global([role='cell'][data-column-id='actions']) {
                border-left: none !important;
            }

            :global(
                [role='cell'][data-suggested-column='true']:has(+ [data-column-id='actions'])
                    .column-resizer-disabled
            ) {
                display: none !important;
            }
        }

        .column-highlight-overlay {
            opacity: 0;
            z-index: 10;
            position: absolute;
            pointer-events: none;
            animation: fadeIn 0.2s ease-out forwards;
            border-radius: var(--border-radius-s, 4px);

            &.selected {
                border: var(--border-width-l) solid rgba(253, 54, 110, 0.6);
            }

            &.hover {
                margin-left: 0;
                background: rgba(253, 54, 110, 0.05);
                border-radius: var(--border-radius-xxs);
                border: var(--border-width-m) solid rgba(253, 54, 110, 0.24);
                transition: background 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

                &.first-column,
                &.last-column {
                    margin-left: -2px;
                }

                &.last-column {
                    width: calc(var(--highlight-width, 0px) + 4.5px) !important;
                }
            }

            &.slide {
                transition:
                    left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                    width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        /* Hide selected column borders when overlay is active - targeted via JS */
        & :global([role='cell'].hide-border .column-resizer-disabled) {
            display: none !important;
        }

        & :global([role='cell']:has(.column-selector-button)) {
            padding: unset;
        }

        & :global(.column-selector-button) {
            width: 100%;
            height: 100%;
            cursor: pointer;

            & :global(.fake-cell) {
                min-height: 40px;
                position: relative;
                align-items: center;
                font-size: var(--font-size-s);
                padding: var(--space-4) var(--space-6);
            }
        }

        .columns-range-overlay {
            position: absolute;
            left: var(--group-left, 0px);
            width: var(--group-width, 100%);
            height: 100%;
            background: color-mix(in oklab, #fd366e 7%, transparent);
            pointer-events: none;
            z-index: 21;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

            &.no-transition {
                transition: opacity 500ms ease-in-out;
            }

            /* pretty gradient wash (with fallback) */
            background: rgba(253, 54, 110, 0.07);
            @supports (background: color-mix(in oklab, #fd366e 7%, transparent)) {
                background: linear-gradient(
                    135deg,
                    color-mix(in oklab, #fd366e 7%, transparent) 0%,
                    color-mix(in oklab, #fe9567 7%, transparent) 100%
                );
            }

            &.thinking {
                margin-block-start: 2px;
                height: calc(100% - 4px);
                border-radius: var(--border-radius-S, 8px);
                box-shadow:
                    0 0 0 var(--border-width-l, 2px) #fd366e,
                    inset 0 0 0 1px color-mix(in oklab, #fe9567 20%, transparent);

                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

                &::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.8),
                        transparent
                    );
                    animation: inner-shimmer 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                }

                &[data-anim='glow'],
                &[data-anim='both'] {
                    box-shadow: none;
                    height: 100% !important;
                    margin-block-start: unset !important;
                    // background: transparent;
                    // main spot for handling the glow animations!
                    background: rgba(253, 54, 110, 0.04);

                    .ai-border-glow {
                        inset: 0;

                        position: absolute;
                        border-radius: var(--border-radius-S, 8px);
                        pointer-events: none;
                        overflow: hidden;

                        --border-pink: rgba(253, 54, 110, 0.35);
                        --border-orange: rgba(254, 149, 103, 0.12);
                        --glow-main: rgba(253, 54, 110, 0.25);
                        --glow-secondary: rgba(253, 54, 110, 0.15);

                        /* animated gradient ring */
                        &::before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            border-radius: inherit;
                            padding: 2px; /* ring width */
                            box-sizing: border-box;
                            background: linear-gradient(
                                120deg,
                                var(--border-pink) 0%,
                                var(--border-pink) 25%,
                                var(--border-orange) 50%,
                                var(--border-pink) 75%,
                                var(--border-pink) 100%
                            );
                            background-size: 300% 300%;
                            animation: borderGlow 12s ease-in-out infinite;

                            -webkit-mask:
                                linear-gradient(#fff 0 0) content-box,
                                linear-gradient(#fff 0 0);
                            -webkit-mask-composite: xor;
                            mask:
                                linear-gradient(#fff 0 0) content-box,
                                linear-gradient(#fff 0 0);
                            mask-composite: exclude;
                        }

                        .inner {
                            position: absolute;
                            inset: 2px;
                            border-radius: calc(var(--border-radius-S, 8px) - 2px);
                            background: transparent;
                            overflow: hidden;
                            pointer-events: none;

                            /* top-left radial glow */
                            &::before {
                                content: '';
                                position: absolute;
                                inset: 0;
                                background: radial-gradient(
                                    circle at bottom left,
                                    var(--glow-main),
                                    rgba(253, 54, 110, 0) 50%
                                );
                                opacity: 0.2;
                                animation: glowPulse 6s ease-in-out infinite;
                                animation-delay: 0s;
                                pointer-events: none;
                                border-radius: inherit;
                            }

                            /* top-right radial glow */
                            &::after {
                                content: '';
                                position: absolute;
                                inset: 0;
                                background: radial-gradient(
                                    circle at top right,
                                    var(--glow-secondary),
                                    rgba(253, 54, 110, 0) 20%
                                );
                                opacity: 0.15;
                                animation: glowPulse 6s ease-in-out infinite;
                                animation-delay: 2s;
                                pointer-events: none;
                                border-radius: inherit;
                            }

                            /* bottom-left and bottom-right glows */
                            .bottom-corners {
                                position: absolute;
                                inset: 0;
                                pointer-events: none;
                                border-radius: inherit;
                                box-shadow:
                                    inset 0 -50% 100px -40px var(--glow-main),
                                    inset -50% 0 100px -40px var(--glow-secondary);
                                animation: glowPulse 6s ease-in-out infinite;
                                animation-delay: 3s;
                            }
                        }
                    }
                }

                /* disable sweep shimmer in glow-only */
                &[data-anim='glow'] {
                    &::after {
                        content: none;
                    }
                }

                /* hide glow wrapper entirely in shimmer mode */
                &[data-anim='shimmer'] {
                    .ai-border-glow {
                        display: none;
                    }
                }
            }
        }

        & .floating-action-wrapper {
            // probably limited, but has good support
            // for height transition with fit-content and auto, etc.
            @supports (interpolate-size: allow-keywords) {
                interpolate-size: allow-keywords;
            }

            & > :global(div:first-child) {
                z-index: 22;
                bottom: 24px;
                height: 44px;
                left: calc(65% - 480px / 2);
                transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1);

                @media (max-width: 1024px) {
                    left: calc(50% - 480px / 2);
                }

                @media (max-width: 768px) {
                    left: calc(50% - 400px / 2);
                    max-width: 400px !important;
                }
            }

            &.expanded > :global(div:first-child) {
                left: calc(60% - 480px / 2);
                max-width: 480px !important;

                @media (max-width: 1024px) {
                    left: calc(50% - 480px / 2);
                }

                @media (max-width: 768px) {
                    left: calc(50% - 400px / 2);
                    max-width: 400px !important;
                }
            }

            &.selection {
                & > :global(div:first-child) {
                    padding: var(--space-3) var(--space-5) !important;
                }

                & :global(div:first-child) {
                    z-index: 21;
                    bottom: 56px; /* oddly specific maybe, but diff as per design */
                    height: fit-content;
                    padding-bottom: 10px;
                    border-bottom: unset;
                    border-bottom-left-radius: 0;
                    border-bottom-right-radius: 0;
                    background: var(--bgcolor-neutral-default);
                }
            }

            &.creating-columns :global(:first-child) {
                left: calc(67.5% - 480px / 2);
                max-width: 157px !important;

                @media (max-width: 1024px) {
                    left: calc(50% - 157px / 2);
                }
            }
        }

        & :global(.spreadsheet-container) {
            overflow-x: auto;
            overflow-y: auto;
            scrollbar-width: none;
        }

        &.thinking {
            & :global(.spreadsheet-container) {
                overflow: hidden !important;
            }
        }

        & :global([data-select='true']) {
            // opacity: 0.85;
            pointer-events: none;
        }

        /* alternative selector for header selection */
        & :global(.sticky-header [data-select='true']) {
            opacity: 1;
            pointer-events: none;
        }
    }

    .snow-fade-bottom,
    .spreadsheet-fade-bottom {
        bottom: 0;
        width: 100%;
        position: fixed;
        z-index: 20; /* under overlay */
        display: flex;
        justify-content: center;
        transition: opacity 500ms ease-in-out;

        pointer-events: none;
    }

    .spreadsheet-fade-bottom {
        height: var(--overlay-height);
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.86) 85%,
            /* show more of the bottom area */ var(--bgcolor-neutral-primary) 100%
        );
    }

    .snow-fade-bottom {
        height: calc(var(--overlay-height) / 2);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 94.45%);
    }

    :global(.theme-dark) .snow-fade-bottom,
    :global(.theme-dark) .spreadsheet-fade-bottom {
        background: linear-gradient(
            180deg,
            rgba(29, 29, 33, 0) 0%,
            rgba(29, 29, 33, 0.86) 85%,
            /* show more of the bottom area */ var(--bgcolor-neutral-primary) 100%
        );
    }

    @keyframes inner-shimmer {
        0% {
            left: -100%;
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            left: 100%;
            opacity: 0;
        }
    }

    :global(.theme-dark) .spreadsheet-container-outer {
        --columns-range-pink-header-background-color: unset;
        --columns-range-pink-border-color: rgba(253, 54, 110, 0.12) !important;
    }

    :global(.theme-dark) .columns-range-overlay.thinking {
        &::before {
            background: linear-gradient(
                90deg,
                rgba(253, 54, 110, 0.01),
                rgba(254, 149, 103, 0.03),
                rgba(253, 54, 110, 0.01),
                rgba(254, 149, 103, 0.03),
                rgba(253, 54, 110, 0.01)
            );
        }

        &::after {
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
        }
    }

    :global(.cell-editor) {
        width: 100%;
        margin-inline-start: -1.5px;
    }

    :global(.cell-editor .input) {
        display: inline-flex;
        align-items: center !important;
        background: rgba(253, 54, 110, 0.12);
        border: var(--border-width-L, 2px) solid rgba(253, 54, 110, 0.24) !important;

        & :global(i) {
            margin-inline-end: 4px !important;
            //margin-block-start: -4px !important;
        }

        & :global(::selection) {
            background: var(--brand-pink-200, #feafc5) !important;
        }
    }

    :global(.filter-modal-actions-menu.variant) {
        max-height: 184px;
    }

    .column-title {
        max-width: 125px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Sequential animation for column titles and icons */
    .column-title,
    .column-icon-wrapper {
        opacity: 0;
        flex-shrink: 0;
        transform: translateY(4px);
        transition:
            opacity 0.4s ease-out,
            transform 0.4s ease-out;
    }

    .column-title.animate-in,
    .column-icon-wrapper.animate-in {
        opacity: 1;
        transform: translateY(0);
        transition-delay: var(--animation-delay, 0ms);
    }

    .custom-tooltip {
        opacity: 0;
        z-index: 22;
        visibility: hidden;

        position: fixed;
        touch-action: none;
        pointer-events: none;
        align-items: center;
        display: inline-flex;
        justify-content: center;
        gap: var(--space-0, 0);
        margin-inline-start: 0.5rem;
        color: var(--fgcolor-on-invert);
        border-radius: var(--border-radius-s);
        padding: var(--space-2) var(--space-4);
        background: var(--bgcolor-neutral-invert-weak);
        left: calc(var(--highlight-left, 0px) + var(--tooltip-offset, 325px));

        transition:
            top 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            left 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);

        &.show-tooltip {
            opacity: 1;
            visibility: visible;
        }
    }

    /* Countdown progress styles */
    //.countdown-wrapper {
    //    display: flex;
    //    width: var(--icon-size-s);
    //    height: var(--icon-size-s);
    //}
    //
    //:global(.countdown-circle) {
    //    animation: countdown-progress linear forwards;
    //}
    //
    //@media (prefers-reduced-motion: reduce) {
    //    :global(.countdown-circle) {
    //        animation: none;
    //    }
    //}
    //
    //@keyframes countdown-progress {
    //    from {
    //        stroke-dashoffset: 0;
    //    }
    //    to {
    //        stroke-dashoffset: 67.858;
    //    }
    //}

    @keyframes borderGlow {
        0% {
            background-position: 0% 0%;
        }
        25% {
            background-position: 100% 0%;
        }
        50% {
            background-position: 100% 100%;
        }
        75% {
            background-position: 0% 100%;
        }
        100% {
            background-position: 0% 0%;
        }
    }

    @keyframes glowPulse {
        0%,
        100% {
            opacity: 0.1;
        }
        50% {
            opacity: 0.6;
        }
    }
</style>
