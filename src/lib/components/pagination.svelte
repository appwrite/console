<script lang="ts">
    import { page as pageStore } from '$app/state';
    import { Pagination } from '@appwrite.io/pink-svelte';

    export let sum: number;
    export let limit: number;
    export let offset: number;

    $: currentPage = Math.floor(offset / limit + 1);

    function getLink(page: number): string {
        const url = new URL(pageStore.url);
        if (page === 1) {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', page.toString());
        }

        return url.toString();
    }
</script>

<Pagination page={currentPage} total={sum} {limit} createLink={getLink} />
