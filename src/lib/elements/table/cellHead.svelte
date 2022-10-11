<script lang="ts">
    export let width: number = null;
</script>

<div style={`--p-col-width:${width?.toString() ?? ''}`} class="table-thead-col" role="columnheader">
    <span class="eyebrow-heading-3">
        <slot />
    </span>
</div>
