<script lang="ts">
    import { page as pageStore } from '$app/state';
    import { Pagination } from '@appwrite.io/pink-svelte';

    export let sum: number;
    export let limit: number;
    export let offset: number;
    export let useCreateLink = true;
    export let pageParam: string = 'page';
    export let removeOnFirstPage: boolean = false;

    $: currentPage = Math.floor(offset / limit + 1);

    function getLink(page: number): string {
        const url = new URL(pageStore.url);
        if (page === 1) {
            if (removeOnFirstPage) {
                url.searchParams.delete(pageParam);
            } else {
                url.searchParams.set(pageParam, '1');
            }
        } else {
            url.searchParams.set(pageParam, page.toString());
        }

        return url.toString();
    }

    $: paginationProps = useCreateLink
        ? ({ type: 'link', createLink: getLink } as const)
        : ({ type: 'button', createLink: undefined as never } as const);
</script>

<Pagination on:page {limit} total={sum} page={currentPage} {...paginationProps} />
