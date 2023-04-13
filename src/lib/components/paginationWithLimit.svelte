<script lang="ts">
    import Limit from './limit.svelte';
    import Pagination from './pagination.svelte';

    export let limit: number;
    export let offset: number;
    export let total: number;
    export let name: string;
</script>

<div class="u-flex u-margin-block-start-32 u-flex-wrap">
    <Limit {limit} sum={total} {name} />
    <div class="u-margin-inline-start-auto">
        <Pagination {limit} {offset} sum={total} />
    </div>
</div>
