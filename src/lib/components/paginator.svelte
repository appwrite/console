<script lang="ts" generics="T">
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import PaginationInline from './paginationInline.svelte';
    import Limit from './limit.svelte';
    import type { Snippet } from 'svelte';

    let {
        items = [],
        limit = $bindable(5),
        hideFooter = false,
        hidePages = true,
        hasLimit = false,
        name = 'items',
        gap = 's',
        children
    }: {
        items: T[];
        limit?: number;
        hideFooter?: boolean;
        hidePages?: boolean;
        hasLimit?: boolean;
        name?: string;
        gap?:
            | ('none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl')
            | undefined;
        children: Snippet<[T[], number]>;
    } = $props();

    let total = $derived(items.length);

    let offset = $state(0);

    let paginatedItems = $derived(items.slice(offset, offset + limit));
</script>

<Layout.Stack {gap}>
    {@render children(paginatedItems, limit)}

    {#if !hideFooter}
        <Layout.Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            wrap="wrap">
            {#if hasLimit}
                <Limit bind:limit sum={total} {name} />
            {:else}
                <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                    Total results: {total}
                </Typography.Text>
            {/if}

            <PaginationInline {limit} bind:offset {total} {hidePages} />
        </Layout.Stack>
    {/if}
</Layout.Stack>
