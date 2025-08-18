<script lang="ts">
    import { onMount, onDestroy, type Snippet, tick } from 'svelte';
    import { expandTabs, scrollStore } from '../store';

    let {
        observeExpand = false,
        children
    }: {
        observeExpand?: boolean;
        children: Snippet;
    } = $props();

    let base = $state(0);
    let isFirstMount = $state(true);
    let spreadsheetWrapper: HTMLDivElement;
    let spreadsheetHeight = $state('74.5vh');
    let spreadsheetGridContainer: HTMLDivElement;
    let resizeTimeout: ReturnType<typeof setTimeout>;
    let unsubscribeExpandTabs: (() => void) | null = null;

    function initSpreadsheetGridContainer(): boolean {
        if (!spreadsheetWrapper) return false;

        spreadsheetGridContainer = spreadsheetWrapper.querySelector('.spreadsheet-container');
        return !!spreadsheetGridContainer;
    }

    /** adjust height to fill remaining viewport space */
    export function resizeSheet(fromResize: boolean = false): void {
        if (!spreadsheetWrapper) return;

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            const rect = spreadsheetWrapper.getBoundingClientRect();
            base = window.innerHeight - rect.top;

            let headerHeightDiff = 0;
            if (observeExpand && !isFirstMount && !fromResize) {
                /**
                 * 16px from padding top
                 * 08px from padding bottom
                 * 65px from block size difference on cover
                 * ————————————————
                 * 89px
                 */
                headerHeightDiff = $expandTabs ? -89 : 89;
            }

            spreadsheetHeight = `${base + headerHeightDiff}px`;
            isFirstMount = false;
        }, 16);
    }

    export function saveGridSheetScroll(): void {
        if (initSpreadsheetGridContainer()) {
            scrollStore.set(spreadsheetGridContainer.scrollLeft || 0);
        }
    }

    export function restoreGridSheetScroll(): void {
        if (initSpreadsheetGridContainer() && spreadsheetGridContainer.scrollWidth > 0) {
            spreadsheetGridContainer.scrollTop = 0;
            spreadsheetGridContainer.scrollLeft = $scrollStore;
        }
    }

    onMount(() => {
        resizeSheet();

        if (observeExpand) {
            unsubscribeExpandTabs = expandTabs.subscribe(async () => {
                await tick();
                resizeSheet();
            });
        }
    });

    onDestroy(() => {
        clearTimeout(resizeTimeout);
        unsubscribeExpandTabs?.();
    });
</script>

<svelte:window on:resize={() => resizeSheet(true)} />

<div bind:this={spreadsheetWrapper} class="spreadsheet-wrapper" style:height={spreadsheetHeight}>
    {@render children()}
</div>

<style>
    .spreadsheet-wrapper {
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
</style>
