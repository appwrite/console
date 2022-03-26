<script lang="ts">
    export let width: number = null;
</script>

<th width={width?.toString() ?? ''} class="table-thead-col">
    <span class="text">
        <slot />
    </span>
</th>
