<script lang="ts">
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import PaginationInline from './paginationInline.svelte';
    import Limit from './limit.svelte';

    let {
        items = [],
        limit = $bindable(5),
        hideFooter = false,
        hidePages = true,
        hasLimit = false,
        name = 'items',
        children
    } = $props();

    let total = $derived(items.length);

    let offset = $state(0);

    let paginatedItems = $derived(items.slice(offset, offset + limit));
</script>

<Layout.Stack gap="s">
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
