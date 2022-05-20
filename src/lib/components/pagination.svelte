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
        }
    }

    function handleButtonPage(direction: string) {
        if (direction === 'next' && currentPage < totalPages) {
            currentPage += 1;
            offset = limit * (currentPage - 1);
            dispatch('change');
        } else if (direction === 'prev' && currentPage > 1) {
            currentPage -= 1;
            offset = limit * (currentPage - 1);
            dispatch('change');
        }
    }

    let pages = pagination(currentPage, totalPages);

    function pagination(current: number, total: number) {
        let delta = 2,
            left = current - delta,
            right = current + delta + 1,
            range = [],
            rangeWithDots = [];

        for (let i = 1; i <= total; i++) {
            if (i == 1 || i == total || (i >= left && i < right)) {
                range.push(i);
            }
        }

        rangeWithDots = range.reduce((prev, current, index) => {
            if (current - prev[index - 1] > delta) {
                prev.push('...');
            }
            prev.push(current);
            return prev;
        }, []);
        return rangeWithDots;
    }
</script>

{#if totalPages > 1}
    <nav class="pagination">
        <span
            on:click={() => handleButtonPage('prev')}
            class:is-disabled={currentPage <= 1}
            class="button is-text"
            aria-label="prev page">
            <span class="icon-cheveron-left" aria-hidden="true" />
            <span class="text">Prev</span>
        </span>
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
        <span
            on:click={() => handleButtonPage('next')}
            class:is-disabled={currentPage === totalPages}
            class="button is-text"
            aria-label="next page">
            <span class="text">Next</span>
            <span class="icon-cheveron-right" aria-hidden="true" />
        </span>
    </nav>
{/if}
