<script lang="ts">
    import { IconChevronLeft, IconChevronRight } from '@appwrite.io/pink-icons-svelte';
    import { Button, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let sum: number;
    export let limit: number;
    export let offset: number;
    export let hidePages = false;

    const dispatch = createEventDispatcher();

    $: totalPages = Math.ceil(sum / limit);
    $: currentPage = Math.floor(offset / limit + 1);
    $: pages = pagination(currentPage, totalPages);

    function handleOptionClick(page: number) {
        if (currentPage !== page) {
            offset = limit * (page - 1);
            dispatch('change');
        }
    }

    function handleButtonPage(direction: string) {
        if (direction === 'next' && currentPage < totalPages) {
            offset = limit * (currentPage - 1);
            dispatch('change');
        } else if (direction === 'prev' && currentPage > 1) {
            offset = limit * (currentPage - 1);
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

{#if totalPages > 1}
    <Layout.Stack direction="row">
        <Button.Button
            size="s"
            variant="compact"
            on:click={() => handleButtonPage('prev')}
            disabled={currentPage <= 1}>
            <Icon icon={IconChevronLeft} slot="start" />
            Prev
        </Button.Button>
        {#if !hidePages}
            <ol class="pagination-list is-only-desktop">
                {#each pages as page}
                    {#if typeof page === 'number'}
                        <li class="pagination-item">
                            <button
                                type="button"
                                class="button"
                                on:click={() => handleOptionClick(+page)}
                                class:is-disabled={currentPage === page}
                                class:is-text={currentPage !== page}
                                aria-label="page">
                                <span class="text">{page}</span>
                            </button>
                        </li>
                    {:else}
                        <li class="li is-text">
                            <span class="icon">...</span>
                        </li>
                    {/if}
                {/each}
            </ol>
        {/if}
        <Button.Button
            size="s"
            variant="compact"
            on:click={() => handleButtonPage('next')}
            disabled={currentPage === totalPages}>
            <Icon icon={IconChevronRight} slot="end" />
            Next
        </Button.Button>
    </Layout.Stack>
{:else}
    <nav class="pagination">
        <button type="button" class="button is-text is-disabled" aria-label="prev page">
            <span class="icon-cheveron-left" aria-hidden="true"></span>
            <span class="text">Prev</span>
        </button>
        {#if !hidePages}
            <ol class="pagination-list is-only-desktop">
                <li class="pagination-item">
                    <button type="button" class="button is-disabled" aria-label="page">
                        <span class="text">1</span>
                    </button>
                </li>
            </ol>
        {/if}
        <button type="button" class="button is-text is-disabled" aria-label="next page">
            <span class="text">Next</span>
            <span class="icon-cheveron-right" aria-hidden="true"></span>
        </button>
    </nav>
{/if}
