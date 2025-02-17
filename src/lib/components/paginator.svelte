<script lang="ts">
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import PaginationInline from './paginationInline.svelte';

    export let items = [];
    export let limit = 5;
    export let hideFooter = false;

    let offset = 0;

    $: total = items?.length;
    $: paginatedItems = items.slice(offset, offset + limit);
</script>

<Layout.Stack gap="s">
    <slot {paginatedItems} {limit} />

    {#if !hideFooter}
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography.Text variant="m-400" color="--color-fgcolor-neutral-secondary"
                >Total results: {total}</Typography.Text>
            <PaginationInline {limit} bind:offset sum={total} hidePages />
        </Layout.Stack>
    {/if}
</Layout.Stack>
