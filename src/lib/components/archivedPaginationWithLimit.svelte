<script lang="ts">
    import ArchivedLimit from './archivedLimit.svelte';
    import ArchivedPagination from './archivedPagination.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';

    let {
        limit,
        offset,
        total,
        name,
        useCreateLink = true
    }: {
        limit: number;
        offset: number;
        total: number;
        name: string;
        useCreateLink?: boolean;
    } = $props();

    const showLimit = $derived(!!useCreateLink);
    const direction = $derived(showLimit ? 'row' : 'column');
    const alignItems = $derived(showLimit ? 'center' : 'flex-end');
</script>

<Layout.Stack wrap="wrap" {direction} {alignItems} justifyContent="space-between">
    {#if showLimit}
        <ArchivedLimit {limit} sum={total} {name} />
    {/if}

    <ArchivedPagination on:page {limit} {offset} sum={total} />
</Layout.Stack>
