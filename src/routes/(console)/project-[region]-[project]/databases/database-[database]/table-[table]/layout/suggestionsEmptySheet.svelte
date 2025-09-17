<script lang="ts">
    import {
        Button,
        Icon,
        Layout,
        Spinner,
        Spreadsheet,
        Typography,
        FloatingActionBar
    } from '@appwrite.io/pink-svelte';
    import { IconCalendar, IconFingerPrint, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { SortButton } from '$lib/components';
    import type { Column } from '$lib/helpers/types';
    import { expandTabs } from '../store';
    import SpreadsheetContainer from './spreadsheet.svelte';
    import { onDestroy, onMount } from 'svelte';
    import { debounce } from '$lib/helpers/debounce';
    import { tableColumnSuggestions } from '../../store';

    const {
        customColumns = []
    }: {
        customColumns?: Column[];
    } = $props();

    /**
     * flip this when you want to
     * exclude or include the `$id` for colored overlay!
     */
    const useFirstColumnAsId = false;

    // can also be `__select_undefined` if `$id` needs to be covered on overlay!
    const firstColumn = useFirstColumnAsId ? '$id' : '__select_undefined';

    let resizeObserver: ResizeObserver;
    let spreadsheetContainer: HTMLElement;

    let hScroller: HTMLElement | null = null;
    let headerElement: HTMLElement | null = null;
    let rangeOverlayEl: HTMLDivElement | null = null;

    const baseColProps = { draggable: false, resizable: false };

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
            headerElement = spreadsheetContainer.querySelector('[role="rowheader"]');
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

    // Measure first content header
    // and the cell before `actions`|`empty`
    const updateOverlayBounds = () => {
        if (!spreadsheetContainer) return;
        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer.querySelector('[role="rowheader"]');
            if (!headerElement) return;
        }

        // hook the actual horizontal scroller once
        if (!hScroller || !hScroller.isConnected) {
            hScroller = findHorizontalScroller(headerElement);
            if (hScroller) hScroller.addEventListener('scroll', debouncedRecalc, { passive: true });
        }

        const containerRect = spreadsheetContainer.getBoundingClientRect();
        const getById = (id: string) =>
            headerElement!.querySelector<HTMLElement>(
                `[role="cell"][data-header="true"][data-column-id="${id}"]`
            );

        const firstColumnCell = getById(firstColumn);
        // const emptyCell = getById('empty');
        // const actionsCell = getById('actions');

        // start = first content cell after `firstColumn`
        // (skip actions/empty if they were there)
        let startCell: HTMLElement | null = null;
        if (firstColumnCell) {
            let node = firstColumnCell.nextElementSibling as HTMLElement | null;
            while (
                node &&
                (node.dataset.columnId === 'actions' || node.dataset.columnId === 'empty')
            ) {
                node = node.nextElementSibling as HTMLElement | null;
            }
            startCell = node;
        }

        // end = cell right BEFORE actions;
        // else right BEFORE empty; else last content cell
        // const before = (element: HTMLElement | null) => {
        //     if (!element) return null;
        //     let previous = element.previousElementSibling as HTMLElement | null;
        //     while (
        //         previous &&
        //         (previous.dataset.columnId === firstColumn ||
        //             previous.getAttribute('data-select') === 'true')
        //     ) {
        //         previous = previous.previousElementSibling as HTMLElement | null;
        //     }
        //     return previous;
        // };

        // let endCell = before(actionsCell) ?? before(emptyCell);
        // let endCell = before(emptyCell);

        if (!startCell /* || !endCell*/) {
            if (rangeOverlayEl) rangeOverlayEl.style.display = 'none';
            return;
        }

        const start = startCell.getBoundingClientRect();
        // const end = endCell.getBoundingClientRect();
        const left = Math.round(start.left - containerRect.left);
        // const width = Math.max(0, Math.round(end.right - start.right));

        spreadsheetContainer.style.setProperty('--group-left', `${left}px`);
        // spreadsheetContainer.style.setProperty('--group-width', `${width}px`);

        // if (rangeOverlayEl) {
        //     rangeOverlayEl.style.display = width > 0 ? 'block' : 'none';
        // }
    };

    const recalcAll = () => {
        updateOverlayHeight();
        updateOverlayBounds();
    };

    const debouncedRecalc = debounce(recalcAll, 50);

    onMount(() => {
        if (spreadsheetContainer) {
            resizeObserver = new ResizeObserver(debouncedRecalc);
            resizeObserver.observe(spreadsheetContainer);
        }

        requestAnimationFrame(recalcAll);
    });

    onDestroy(() => {
        resizeObserver?.disconnect();
        hScroller?.removeEventListener('scroll', debouncedRecalc);
    });

    const getCustomColumns = (): Column[] =>
        customColumns.map((col: Column) => ({ ...col, width: 180, hide: false, ...baseColProps }));

    const getRowColumns = (): Column[] => [
        {
            id: '$id',
            title: '$id',
            type: 'string',
            width: 180,
            icon: IconFingerPrint,
            ...baseColProps
        },
        ...getCustomColumns(),
        {
            id: '$createdAt',
            title: '$createdAt',
            type: 'datetime',
            width: 180,
            icon: IconCalendar,
            ...baseColProps
        },
        {
            id: '$updatedAt',
            title: '$updatedAt',
            type: 'datetime',
            width: 180,
            icon: IconCalendar,
            ...baseColProps
        },
        {
            id: 'actions',
            title: '',
            type: 'string',
            icon: IconPlus,
            width: customColumns.length ? 555 : 832,
            ...baseColProps
        },
        { id: 'empty', title: '', type: 'string', ...baseColProps }
    ];

    const spreadsheetColumns = getRowColumns();
    const emptyCells = $derived(($isSmallViewport ? 14 : 17) + (!$expandTabs ? 2 : 0));
</script>

<svelte:window on:resize={debouncedRecalc} on:scroll={debouncedRecalc} />

<div bind:this={spreadsheetContainer} class="databases-spreadsheet spreadsheet-container-outer">
    <div>
        <div
            aria-hidden="true"
            bind:this={rangeOverlayEl}
            class="columns-range-overlay"
            class:thinking={$tableColumnSuggestions.thinking}>
        </div>

        {#if $tableColumnSuggestions.thinking}
            <div class="floating-action-wrapper">
                <FloatingActionBar>
                    <svelte:fragment slot="start">
                        <Layout.Stack direction="row" gap="xxs" alignItems="center">
                            <Spinner size="s" />
                            <Typography.Text style="white-space: nowrap">
                                Thinking of column suggestions
                            </Typography.Text>
                        </Layout.Stack>
                    </svelte:fragment>
                    <svelte:fragment slot="end">
                        <Button.Button
                            size="xs"
                            variant="secondary"
                            on:click={() => {
                                $tableColumnSuggestions.context = null;
                                $tableColumnSuggestions.enabled = false;
                                $tableColumnSuggestions.thinking = false;
                            }}
                            >Cancel
                        </Button.Button>
                    </svelte:fragment>
                </FloatingActionBar>
            </div>
        {/if}
    </div>

    <SpreadsheetContainer>
        <Spreadsheet.Root
            {emptyCells}
            allowSelection
            height="100%"
            columns={spreadsheetColumns}
            bottomActionClick={() => {}}>
            <svelte:fragment slot="header" let:root>
                {#each spreadsheetColumns as column (column.id)}
                    <Spreadsheet.Header.Cell
                        {root}
                        column={column.id}
                        icon={column.icon ?? undefined}>
                        {#if column.isAction}
                            <Button.Button icon variant="extra-compact">
                                <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                            </Button.Button>
                        {:else if column.id === 'actions' || column.id === 'empty'}
                            {column.title}
                        {:else}
                            <Layout.Stack
                                gap="xs"
                                direction="row"
                                alignItems="center"
                                alignContent="center">
                                {column.title}
                                <SortButton disabled column={column.id} />
                            </Layout.Stack>
                        {/if}
                    </Spreadsheet.Header.Cell>
                {/each}
            </svelte:fragment>
        </Spreadsheet.Root>
    </SpreadsheetContainer>

    <div
        class="spreadsheet-fade-bottom"
        data-collapsed-tabs={!$expandTabs}
        style="height: var(--overlay-height)">
    </div>
</div>

<style lang="scss">
    .spreadsheet-container-outer {
        width: 100%;
        position: fixed;
        overflow: hidden;

        & :global([role='rowheader'] :nth-last-child(2) [role='presentation']) {
            display: none;
        }

        .columns-range-overlay {
            width: 100%;
            position: absolute;
            margin-block-start: 2px;
            left: var(--group-left, 0px);
            height: calc(var(--overlay-height, 60vh) + 36px);
            border-radius: var(--border-radius-S, 8px);
            background: color-mix(in oklab, #fd366e 7%, transparent);
            pointer-events: none;
            z-index: 21;
            overflow: hidden;

            /* border + inner hairline without double-counting */
            box-shadow:
                0 0 0 var(--border-width-L, 2px) #fd366e,
                inset 0 0 0 1px color-mix(in oklab, #fe9567 20%, transparent);

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
                &::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    border-radius: inherit;
                    padding: 2px;
                    background: linear-gradient(
                        90deg,
                        rgba(253, 54, 110, 0.02),
                        rgba(254, 149, 103, 0.05),
                        rgba(253, 54, 110, 0.02),
                        rgba(254, 149, 103, 0.05),
                        rgba(253, 54, 110, 0.02)
                    );
                    background-size: 400% 100%;
                    animation: border-shimmer 4s ease-in-out infinite;
                    z-index: -1;
                }

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
                        rgba(255, 255, 255, 0.08),
                        transparent
                    );
                    animation: inner-shimmer 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                    z-index: 1;
                }
            }
        }

        & .floating-action-wrapper :global(:first-child) {
            left: 45%; /* change this value if the firstColumn is changed for overlay logic.*/
            z-index: 21;
        }

        & :global(.spreadsheet-container) {
            overflow-x: hidden;
            overflow-y: hidden;
        }

        & :global([data-select='true']) {
            opacity: 0.85;
            pointer-events: none;
        }
    }

    .spreadsheet-fade-bottom {
        bottom: 0;
        width: 100%;
        position: fixed;
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.855) 21%,
            #fff 100%
        );
        z-index: 20; /* under overlay */
        display: flex;
        justify-content: center;
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    :global(.theme-dark) .spreadsheet-fade-bottom {
        background: linear-gradient(
            180deg,
            rgba(25, 25, 28, 0.38) 13%,
            rgba(25, 25, 28, 0.7) 21%,
            rgba(25, 25, 28, 0.95) 38%,
            var(--bgcolor-neutral-default, #19191c) 100%
        );
    }

    @keyframes border-shimmer {
        0% {
            background-position: 400% 0;
        }
        50% {
            background-position: -50% 0;
        }
        100% {
            background-position: -400% 0;
        }
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
</style>
