<script lang="ts">
    let spreadsheetHeight = '74.5vh';
    let spreadsheetWrapper: HTMLDivElement;

    function resizeSheet() {
        if (!spreadsheetWrapper) return;
        const rect = spreadsheetWrapper.getBoundingClientRect();
        spreadsheetHeight = window.innerHeight - rect.top + 'px';
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
