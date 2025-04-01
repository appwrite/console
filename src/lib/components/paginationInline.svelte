<script lang="ts">
    import { IconChevronLeft, IconChevronRight } from '@appwrite.io/pink-icons-svelte';
    import { Button, Icon, Layout, Pagination } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let total: number;
    export let limit: number;
    export let offset: number;
    export let hidePages = false;

    const dispatch = createEventDispatcher();

    $: totalPages = Math.ceil(total / limit);
    $: currentPage = Math.floor(offset / limit + 1);
    $: pages = pagination(currentPage, totalPages);

    function handleOptionClick(e: CustomEvent) {
        if (currentPage !== e.detail) {
            offset = limit * (e.detail - 1);
            dispatch('change');
        }
    }

    function next() {
        if (currentPage < totalPages) {
            offset = limit * currentPage;
            dispatch('change');
        }
    }

    function prev() {
        if (currentPage > 1) {
            offset = limit * (currentPage - 2);
            dispatch('change');
        }
    }

    function pagination(page: number, total: number) {
        const pagesShown = 5;
        const start = Math.max(
            1,
            Math.min(page - Math.floor((pagesShown - 3) / 2), total - pagesShown + 2)
        );
        const end = Math.min(
            total,
            Math.max(page + Math.floor((pagesShown - 2) / 2), pagesShown - 1)
        );
        return [
            ...(start > 2 ? [1, '...'] : start > 1 ? [1] : []),
            ...Array.from({ length: end + 1 - start }, (_, i) => i + start),
            ...(end < total - 1 ? ['...', total] : end < total ? [total] : [])
        ];
    }
</script>

{#if !hidePages}
    <Pagination
        {limit}
        page={currentPage}
        {total}
        type="button"
        on:next={next}
        on:page={handleOptionClick}
        on:prev={prev} />
{:else}
    <Layout.Stack direction="row" inline>
        <Button.Button
            size="s"
            variant="compact"
            on:click={prev}
            disabled={currentPage <= 1 || totalPages <= 1}>
            <Icon icon={IconChevronLeft} slot="start" />
            Prev
        </Button.Button>

        <Button.Button
            size="s"
            variant="compact"
            on:click={next}
            disabled={currentPage === totalPages || totalPages <= 1}>
            <Icon icon={IconChevronRight} slot="end" />
            Next
        </Button.Button>
    </Layout.Stack>
{/if}
