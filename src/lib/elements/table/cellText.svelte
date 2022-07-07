<script lang="ts">
    export let title: string;
    export let showOverflow = false;
</script>

<div
    class="table-col is-main"
    class:u-overflow-visible={showOverflow}
    data-title={title}
    role="cell">
    <span class="text"><slot /></span>
</div>
