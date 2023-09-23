<script lang="ts">
    import { app } from '$lib/stores/app';
    import Light from '$lib/images/search-light.svg';
    import Dark from '$lib/images/search-dark.svg';
    import PaginationInline from './paginationInline.svelte';

    export let hidePagination = false;
    export let hidePages = false;
</script>

<article class="card u-grid u-cross-center u-width-full-line common-section">
    <div class="u-flex u-flex-vertical u-cross-center u-gap-24 u-overflow-hidden">
        {#if $app.themeInUse === 'dark'}
            <img src={Dark} alt="create" aria-hidden="true" />
        {:else}
            <img src={Light} alt="create" aria-hidden="true" />
        {/if}
        <slot />
    </div>
</article>

{#if !hidePagination}
    <div class="u-flex u-margin-block-start-32 u-main-space-between u-cross-center">
        <p class="text">Total results: 0</p>
        <PaginationInline limit={1} offset={0} sum={0} {hidePages} />
    </div>
{/if}
