<script lang="ts">
    export let onlyDesktop = false;
    export let width: number = null;
    export let main = false;
</script>

<div
    width={width?.toString() ?? ''}
    class:is-main={main}
    class="table-col"
    class:is-only-desktop={onlyDesktop}
    role="cell">
    <slot />
</div>
