<script lang="ts">
    export let onlyDesktop = false;
    export let width: number = null;
</script>

<td width={width?.toString() ?? ''} class="table-col" class:is-only-desktop={onlyDesktop}>
    <slot />
</td>
