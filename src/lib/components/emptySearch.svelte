<script lang="ts">
    import { app } from '$lib/stores/app';
    import Light from '$lib/images/search-light.svg';
    import Dark from '$lib/images/search-dark.svg';
</script>

<article class="card u-grid u-cross-center u-width-full-line common-section">
    <div class="u-flex u-flex-vertical u-cross-center u-gap-24">
        {#if $app.themeInUse === 'dark'}
            <img src={Dark} alt="create" aria-hidden="true" />
        {:else}
            <img src={Light} alt="create" aria-hidden="true" />
        {/if}
        <slot />
    </div>
</article>
