<script lang="ts">
    import { page as pageStore } from '$app/state';
    import { Pagination } from '@appwrite.io/pink-svelte';

    let { sum, limit, offset }: { sum: number; limit: number; offset: number } = $props();

    const currentPage = $derived(Math.floor(offset / limit + 1));

    function getLink(page: number): string {
        const url = new URL(pageStore.url);
        if (page === 1) {
            url.searchParams.delete('archivedPage');
        } else {
            url.searchParams.set('archivedPage', page.toString());
        }

        return url.toString();
    }

    const paginationProps = $derived({ type: 'link', createLink: getLink } as const);
</script>

<Pagination on:page {limit} total={sum} page={currentPage} {...paginationProps} />
