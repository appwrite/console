<script lang="ts">
    import Limit from './limit.svelte';
    import Pagination from './pagination.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let limit: number;
    export let offset: number;
    export let total: number;
    export let name: string;
</script>

<Layout.Stack direction="row" alignItems="center" wrap="wrap" justifyContent="space-between">
    <Limit {limit} sum={total} {name} />
    <Pagination {limit} {offset} sum={total} />
</Layout.Stack>
