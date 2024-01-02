<script lang="ts">
    export let width: number = null;
    export let onlyDesktop = false;
    export let eyebrow = true;
    export let style = '';
</script>

<div
    style:--p-col-width={width?.toString()}
    class:is-only-desktop={onlyDesktop}
    {style}
    class="table-thead-col"
    role="columnheader">
    <span class={eyebrow ? 'eyebrow-heading-3' : 'body-text-2 u-bold'}>
        <slot />
    </span>
</div>
