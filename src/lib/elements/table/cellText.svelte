<script lang="ts">
    import { Trim } from '$lib/components';
    import Cell from './cell.svelte';
    export let title = '';
    export let showOverflow = false;
    export let onlyDesktop = false;
    export let width: number = null;
    export let right = false;
    let className = '';
    export { className as class };
    export let style = '';
</script>

<Cell {title} {showOverflow} {onlyDesktop} {width} {right} class={className} {style}>
    <Trim><slot /></Trim>
</Cell>
