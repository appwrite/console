<script lang="ts">
    import { onMount } from 'svelte';

    let spreadsheetHeight = '75vh';
    let spreadsheetWrapper: HTMLDivElement;

    function resizeSheet() {
        if (!spreadsheetWrapper) return;
        const rect = spreadsheetWrapper.getBoundingClientRect();
        spreadsheetHeight = window.innerHeight - rect.top + 'px';
    }

    onMount(resizeSheet);
</script>

<svelte:window on:resize={resizeSheet} />

<div
    bind:this={spreadsheetWrapper}
    style:height={spreadsheetHeight}
    style:position="relative"
    style:width="100%">
    <slot />
</div>
