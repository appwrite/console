<script lang="ts">
    export let noMargin = false;
    export let noStyles = false;
    export let style = '';
    export let transparent = false;
</script>

<div
    class="table is-selected-columns-mobile"
    class:u-margin-block-start-32={!noMargin}
    class:is-remove-outer-styles={noStyles}
    style={`${style} ${transparent ? '--p-table-bg-color: var(--transparent)' : ''}`}
    role="table"
    data-private>
    <slot />
</div>
