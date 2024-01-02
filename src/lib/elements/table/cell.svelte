<script lang="ts">
    export let title = '';
    export let onlyDesktop = false;
    export let width: number = null;
    export let showOverflow = false;
    let className = '';
    export { className as class };
    export let style = '';
    export let right = false;
</script>

<div
    {style}
    style:--p-col-width={width?.toString() ?? ''}
    class="table-col {className}"
    class:u-overflow-visible={showOverflow}
    class:is-only-desktop={onlyDesktop}
    class:u-flex={right}
    class:u-main-end={right}
    data-title={title}
    role="cell">
    <slot />
</div>
