<script lang="ts">
    import { debounce } from '$lib/helpers/debounce';
    import { scrollStore, sheetHeightStore } from '../store';
    import { onMount, onDestroy, type Snippet } from 'svelte';

    let {
        children
    }: {
        children: Snippet;
    } = $props();

    let spreadsheetWrapper: HTMLDivElement;
    let spreadsheetGridContainer: HTMLDivElement;

    /** resizing logic variables */
    let resizeObserver: ResizeObserver;
    let mutationObserver: MutationObserver;

    /** to avoid querySelector for perf! */
    let cachedElements = new Set<Element>();

    /** writable store to prevent jumps when changing views */
    let spreadsheetHeight = $state($sheetHeightStore);

    const handleResize = debounce(() => resizeSheet(), 125);

    function observeElement(selector: string) {
        const element = document.querySelector(selector);
        if (element && !cachedElements.has(element)) {
            cachedElements.add(element);
            resizeObserver.observe(element);
        }
    }

    /** get the actual spreadsheet-container */
    function initSpreadsheetGridContainer(): boolean {
        if (spreadsheetGridContainer) return true;

        spreadsheetGridContainer = spreadsheetWrapper.querySelector('.spreadsheet-container');
        return !!spreadsheetGridContainer;
    }

    /** adjust height to fill remaining viewport space */
    function resizeSheet(): void {
        if (!spreadsheetWrapper) return;
        const wrapperRect = spreadsheetWrapper.getBoundingClientRect();
        const wrapperTop = wrapperRect.top;
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - wrapperTop;
        const finalHeight = Math.max(100, availableHeight);

        const currentHeight = parseFloat(spreadsheetHeight);
        const heightChanged = Math.abs(currentHeight - finalHeight) > 1;

        if (heightChanged) {
            const newHeight = `${finalHeight}px`;
            spreadsheetHeight = newHeight;
            sheetHeightStore.set(newHeight);
        }
    }

    function addObservers() {
        /** grab the sheet container */
        initSpreadsheetGridContainer();

        resizeObserver = new ResizeObserver(handleResize);

        /** banners */
        observeElement('.top-banner');

        /** expand / collapse tabs */
        observeElement('.layout-header');

        /** just in case */
        resizeObserver.observe(document.body);

        /** add an observer when a banner pops-in */
        mutationObserver = new MutationObserver(() => {
            observeElement('.top-banner');
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /** save grid sheet scroll for restore */
    export function saveGridSheetScroll(): void {
        if (initSpreadsheetGridContainer()) {
            scrollStore.set(spreadsheetGridContainer.scrollLeft || 0);
        }
    }

    /** restore grid sheet scroll from before */
    export function restoreGridSheetScroll(): void {
        if (initSpreadsheetGridContainer() && spreadsheetGridContainer.scrollWidth > 0) {
            spreadsheetGridContainer.scrollTop = 0;
            spreadsheetGridContainer.scrollLeft = $scrollStore;
        }
    }

    onMount(() => {
        addObservers();
        resizeSheet();
    });

    onDestroy(() => {
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
    });
</script>

<div bind:this={spreadsheetWrapper} class="spreadsheet-wrapper" style:height={spreadsheetHeight}>
    {@render children()}
</div>

<style>
    .spreadsheet-wrapper {
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
</style>
