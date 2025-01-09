<script lang="ts">
    import PaginationInline from './paginationInline.svelte';
    import { Card, Empty } from '@appwrite.io/pink-svelte';
    export let hidePagination = false;
    export let hidePages = false;
    export let target = '';
    export let search = '';
</script>

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
    <div class="u-flex u-margin-block-start-32 u-main-space-between u-cross-center">
        <p class="text">Total results: 0</p>
        <PaginationInline limit={1} offset={0} sum={0} {hidePages} />
    </div>
{/if}
