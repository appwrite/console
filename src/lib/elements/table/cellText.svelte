<script lang="ts">
    export let title: string;
</script>

<td class="table-col is-main" data-title={title}>
    <span class="text"><slot /></span>
</td>
