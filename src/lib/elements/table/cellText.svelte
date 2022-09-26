<script lang="ts">
    export let title: string;
    export let showOverflow = false;
    let data: HTMLSpanElement;
</script>

<div class="table-col " class:u-overflow-visible={showOverflow} data-title={title} role="cell">
    <span bind:this={data} class="text u-trim" title={data?.innerText}><slot /></span>
</div>
