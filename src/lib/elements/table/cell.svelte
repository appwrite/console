<script lang="ts">
    export let onlyDesktop = false;
    export let width: number = null;
</script>

<div
    width={width?.toString() ?? ''}
    class="table-col"
    class:is-only-desktop={onlyDesktop}
    role="cell">
    <slot />
</div>
