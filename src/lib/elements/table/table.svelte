<script lang="ts">
    export let noMargin = false;
    export let noStyles = false;
    export let style = '';
    export let transparent = false;
    export let isAutoLayout = false;
    export let tag: 'div' | 'table' = 'div';
    export let dense = false;
</script>

<svelte:element
    this={tag}
    class="table is-selected-columns-mobile"
    class:is-table-layout-auto={isAutoLayout}
    class:u-margin-block-start-32={!noMargin}
    class:is-remove-outer-styles={noStyles}
    class:is-table-row-medium-size={dense}
    {style}
    style:--p-table-bg-color={transparent ? 'var(--transparent)' : ''}
    role="table"
    data-private>
    <slot />
</svelte:element>

<style>
    :global(.table .button.is-text) {
        --p-text-color-default: initial !important;
    }
</style>
