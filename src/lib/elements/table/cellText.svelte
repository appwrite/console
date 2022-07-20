<script lang="ts">
    export let title: string;
    export let showOverflow = false;
    export let main = false;
</script>

<div
    class="table-col"
    class:is-main={main}
    class:u-overflow-visible={showOverflow}
    data-title={title}
    role="cell">
    <span class="text"><slot /></span>
</div>
