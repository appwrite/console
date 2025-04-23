<script lang="ts">
    import PaginationInline from './paginationInline.svelte';
    import { Card, Empty, Layout } from '@appwrite.io/pink-svelte';
    export let hidePagination = false;
    export let hidePages = false;
    export let target = '';
    export let search = '';
</script>

<Layout.Stack gap="l">
    <Card.Base padding="none">
        <Empty
            title={`Sorry, we couldn't find ${search ? `‘${search}’` : `any ${target}`}`}
            description={`There are no ${target} that match your search.`}
            type="secondary">
            <svelte:fragment slot="actions">
                <slot />
            </svelte:fragment>
        </Empty>
    </Card.Base>

    {#if !hidePagination}
        <Layout.Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            wrap="wrap">
            <p class="text">Total results: 0</p>
            <PaginationInline limit={1} offset={0} total={0} {hidePages} />
        </Layout.Stack>
    {/if}
</Layout.Stack>
