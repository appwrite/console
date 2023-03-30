<script lang="ts">
    import { page as pageStore } from '$app/stores';
    import { Button } from '$lib/elements/forms';

    export let sum: number;
    export let limit: number;
    export let offset: number;
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

    function getLink(page: number): string {
        const url = new URL($pageStore.url);
        if (page === 1) {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', page.toString());
        }

        return url.toString();
    }
</script>

{#if totalPages > 1}
    {#key $pageStore.url}
        <nav class="pagination">
            {#if currentPage <= 1}
                <Button disabled text ariaLabel="prev page">
                    <span class="icon-cheveron-left" aria-hidden="true" />
                    <span class="text">Prev</span>
                </Button>
            {:else}
                <Button text ariaLabel="prev page" href={getLink(currentPage - 1)}>
                    <span class="icon-cheveron-left" aria-hidden="true" />
                    <span class="text">Prev</span>
                </Button>
            {/if}
            {#if !hidePages}
                <ol class="pagination-list is-only-desktop">
                    {#each pages as page}
                        {#if typeof page === 'number'}
                            <li class="pagination-item">
                                {#if currentPage === page}
                                    <Button ariaLabel="page" disabled>
                                        <span class="text">{page}</span>
                                    </Button>
                                {:else}
                                    <Button text ariaLabel="page" href={getLink(page)}>
                                        <span class="text">{page}</span>
                                    </Button>
                                {/if}
                            </li>
                        {:else}
                            <li class="li is-text">
                                <span class="icon">...</span>
                            </li>
                        {/if}
                    {/each}
                </ol>
            {/if}
            {#if currentPage >= totalPages}
                <Button disabled text ariaLabel="next page">
                    <span class="text">Next</span>
                    <span class="icon-cheveron-right" aria-hidden="true" />
                </Button>
            {:else}
                <Button text ariaLabel="next page" href={getLink(currentPage + 1)}>
                    <span class="text">Next</span>
                    <span class="icon-cheveron-right" aria-hidden="true" />
                </Button>
            {/if}
        </nav>
    {/key}
{:else}
    <nav class="pagination">
        <Button text disabled ariaLabel="prev page">
            <span class="icon-cheveron-left" aria-hidden="true" />
            <span class="text">Prev</span>
        </Button>
        {#if !hidePages}
            <ol class="pagination-list is-only-desktop">
                <li class="pagination-item">
                    <Button disabled ariaLabel="page">
                        <span class="text">1</span>
                    </Button>
                </li>
            </ol>
        {/if}
        <Button text disabled ariaLabel="next page">
            <span class="text">Next</span>
            <span class="icon-cheveron-right" aria-hidden="true" />
        </Button>
    </nav>
{/if}
