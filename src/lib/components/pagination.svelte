<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let totalItems: number;
    export let pageSize: number;
    export let offset: number;

    const totalPages = Math.ceil(totalItems / pageSize);
    let currentPage = Math.floor(offset / pageSize + 1);

    function handleOptionClick(page: number) {
        if (currentPage !== page) {
            offset = pageSize * (page - 1);
            currentPage = page;
            dispatch('change');
        }
    }
    function handleButtonPage(direction: string) {
        if (direction === 'next' && currentPage < totalPages) {
            currentPage += 1;
            offset = pageSize * (currentPage - 1);
            dispatch('change');
        } else if (direction === 'prev' && currentPage > 1) {
            currentPage -= 1;
            offset = pageSize * (currentPage - 1);
            dispatch('change');
        }
    }

    let pages = pagination(currentPage, totalPages);

    function pagination(current: number, total: number) {
        let delta = 2,
            left = current - delta,
            right = current + delta + 1,
            range = [],
            rangeWithDots = [],
            l;

        for (let i = 1; i <= total; i++) {
            if (i == 1 || i == total || (i >= left && i < right)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    }
</script>

<nav class="pagination">
    <span
        on:click={() => handleButtonPage('prev')}
        class:is-disabled={currentPage <= 1}
        class="button is-text "
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
