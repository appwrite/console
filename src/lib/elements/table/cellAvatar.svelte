<script lang="ts">
    import Cell from './cell.svelte';
    export let src: string;
    export let alt: string;
    export let onlyDesktop = false;
    export let width = 30;
</script>

<Cell {onlyDesktop} {width}>
    <div class="image">
        <img class="avatar" {width} height={width} {src} {alt} />
    </div>
</Cell>
