<script lang="ts">
    export let title = '';
    export let onlyDesktop = false;
    export let width: number = null;
    export let showOverflow = false;
</script>

<div
    style={width ? `--p-col-width:${width?.toString()}` : ''}
    class="table-col"
    class:u-overflow-visible={showOverflow}
    class:is-only-desktop={onlyDesktop}
    data-title={title}
    role="cell">
    <slot />
</div>
