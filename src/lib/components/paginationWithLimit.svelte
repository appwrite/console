<script lang="ts">
    import Limit from './limit.svelte';
    import Pagination from './pagination.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';

    let {
        limit,
        offset,
        total,
        name,
        useCreateLink = true,
        pageParam = 'page',
        removeOnFirstPage = false,
        ...restProps
    }: {
        limit: number;
        offset: number;
        total: number;
        name: string;
        useCreateLink?: boolean;
        pageParam?: string;
        removeOnFirstPage?: boolean;
        [key: string]: unknown;
    } = $props();

    const showLimit = $derived(!!useCreateLink);
    const direction = $derived(showLimit ? 'row' : 'column');
    const alignItems = $derived(showLimit ? 'center' : 'flex-end');
</script>

<Layout.Stack wrap="wrap" {direction} {alignItems} justifyContent="space-between" {...restProps}>
    {#if showLimit}
        <Limit {limit} sum={total} {name} {pageParam} {removeOnFirstPage} />
    {/if}

    <Pagination
        on:page
        {limit}
        {offset}
        sum={total}
        {useCreateLink}
        {pageParam}
        {removeOnFirstPage} />
</Layout.Stack>
