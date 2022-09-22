<script lang="ts">
    import { app } from '$lib/stores/app';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';

    export let isButton = false;
    export let commonSection = false;
</script>

{#if isButton}
    <button
        on:click
        class="card u-grid u-cross-center u-width-full-line dashed"
        class:common-section={commonSection}>
        <div class="u-flex u-flex-vertical u-cross-center">
            {#if $app.themeInUse === 'dark'}
                <img src={EmptyDark} alt="create" aria-hidden="true" />
            {:else}
                <img src={EmptyLight} alt="create" aria-hidden="true" />
            {/if}
            <slot />
        </div>
    </button>
{:else}
    <article
        class="card u-grid u-cross-center u-width-full-line"
        class:common-section={commonSection}>
        <slot />
    </article>
{/if}
