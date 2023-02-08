<script lang="ts">
    import { page } from '$app/stores';

    export let sum: number;
    export let limit: number;
    export let offset: number;
    export let path: string;
    export let hidePages = false;

    $: totalPages = Math.ceil(sum / limit);
    $: currentPage = Math.floor(offset / limit + 1);
    $: pages = pagination(currentPage, totalPages);

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
    {@const search = $page.url.search}
    <nav class="pagination">
        <a
            class:is-disabled={currentPage <= 1}
            class="button is-text"
            aria-label="prev page"
            href={`${path}/${currentPage - 1}${search}`}>
            <span class="icon-cheveron-left" aria-hidden="true" />
            <span class="text">Prev</span>
        </a>
        {#if !hidePages}
            <ol class="pagination-list is-only-desktop">
                {#each pages as page}
                    {#if typeof page === 'number'}
                        <li class="pagination-item">
                            <a
                                href={`${path}/${page}${search}`}
                                class="button"
                                class:is-disabled={currentPage === page}
                                class:is-text={currentPage !== page}
                                aria-label="page">
                                <span class="text">{page}</span>
                            </a>
                        </li>
                    {:else}
                        <li class="li is-text">
                            <span class="icon">...</span>
                        </li>
                    {/if}
                {/each}
            </ol>
        {/if}
        <a
            class:is-disabled={currentPage === totalPages}
            class="button is-text"
            href={`${path}/${currentPage + 1}${search}`}
            aria-label="next page">
            <span class="text">Next</span>
            <span class="icon-cheveron-right" aria-hidden="true" />
        </a>
    </nav>
{:else}
    <nav class="pagination">
        <button type="button" class="button is-text is-disabled" aria-label="prev page">
            <span class="icon-cheveron-left" aria-hidden="true" />
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
            <span class="icon-cheveron-right" aria-hidden="true" />
        </button>
    </nav>
{/if}
