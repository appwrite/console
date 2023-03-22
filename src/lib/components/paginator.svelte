<script lang="ts">
    import PaginationInline from './paginationInline.svelte';

    export let items = [];
    export let limit = 5;

    let offset = 0;

    $: paginatedItems = items.slice(offset, offset + limit);
</script>

<div class="container">
    <slot {paginatedItems} />
</div>

<div class="u-flex u-margin-block-start-32 u-main-space-between">
    <p class="text">Total results: {items?.length}</p>
    <PaginationInline {limit} bind:offset sum={items?.length} hidePages />
</div>
