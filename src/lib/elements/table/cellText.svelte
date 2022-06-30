<script lang="ts">
    export let title: string;
</script>

<div class="table-col is-main" data-title={title} role="cell">
    <span class="text"><slot /></span>
</div>
