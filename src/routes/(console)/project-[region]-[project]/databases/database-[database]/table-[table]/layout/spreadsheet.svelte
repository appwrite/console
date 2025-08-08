<script lang="ts">
    import { scrollStore } from '../store';

    let spreadsheetHeight = '74.5vh';
    let spreadsheetWrapper: HTMLDivElement;
    let spreadsheetGridContainer: HTMLDivElement;

    function initSpreadsheetGridContainer() {
        if (!spreadsheetWrapper) return false;

        spreadsheetGridContainer = spreadsheetWrapper.querySelector('.spreadsheet-container');
        return !!spreadsheetGridContainer;
    }

    /** adjust height to fill remaining viewport space */
    export function resizeSheet() {
        if (!spreadsheetWrapper) return;
        const rect = spreadsheetWrapper.getBoundingClientRect();
        spreadsheetHeight = window.innerHeight - rect.top + 'px';
    }

    export function saveGridSheetScroll() {
        initSpreadsheetGridContainer();
        scrollStore.set(spreadsheetGridContainer?.scrollLeft);
    }

    export function restoreGridSheetScroll() {
        if (initSpreadsheetGridContainer() && spreadsheetGridContainer.scrollWidth > 0) {
            spreadsheetGridContainer.scrollLeft = $scrollStore;
        }
    }

    resizeSheet();
</script>

<svelte:window on:resize={resizeSheet} />

<div
    bind:this={spreadsheetWrapper}
    style:height={spreadsheetHeight}
    style:position="relative"
    style:width="100%">
    <slot />
</div>
