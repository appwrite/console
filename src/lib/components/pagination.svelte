<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    export let sum: number;
    export let limit: number;
    export let offset: number;

    const dispatch = createEventDispatcher();
    const totalPages = Math.ceil(sum / limit);
    let currentPage = Math.floor(offset / limit + 1);

    function handleOptionClick(page: number) {
        if (currentPage !== page) {
            offset = limit * (page - 1);
            currentPage = page;
            dispatch('change');
            pages = pagination(currentPage, totalPages);
        }
    }

    function handleButtonPage(direction: string) {
        if (direction === 'next' && currentPage < totalPages) {
            currentPage += 1;
            offset = limit * (currentPage - 1);
            dispatch('change');
            pages = pagination(currentPage, totalPages);
        } else if (direction === 'prev' && currentPage > 1) {
            currentPage -= 1;
            offset = limit * (currentPage - 1);
            dispatch('change');
            pages = pagination(currentPage, totalPages);
        }
    }

    let pages = pagination(currentPage, totalPages);

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
    <nav class="pagination">
        <button
            on:click={() => handleButtonPage('prev')}
            class:is-disabled={currentPage <= 1}
            class="button is-text"
            aria-label="prev page">
            <span class="icon-cheveron-left" aria-hidden="true" />
            <span class="text">Prev</span>
        </button>
        <ol class="pagination-list is-only-desktop">
            {#each pages as page}
                {#if typeof page === 'number'}
                    <li class="pagination-item">
                        <button
                            class="button"
                            on:click={() => handleOptionClick(page)}
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
        <button
            on:click={() => handleButtonPage('next')}
            class:is-disabled={currentPage === totalPages}
            class="button is-text"
            aria-label="next page">
            <span class="text">Next</span>
            <span class="icon-cheveron-right" aria-hidden="true" />
        </button>
    </nav>
{/if}
