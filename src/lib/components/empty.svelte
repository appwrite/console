<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';

    export let single = false;
</script>

{#if single}
    <article class="card u-grid u-cross-center u-width-full-line" class:common-section={single}>
        <div class="u-flex u-flex-vertical u-cross-center u-gap-24">
            <button type="button" on:click|preventDefault>
                {#if $app.themeInUse === 'dark'}
                    <img src={EmptyDark} alt="create" aria-hidden="true" />
                {:else}
                    <img src={EmptyLight} alt="create" aria-hidden="true" />
                {/if}
            </button>
            <slot />
        </div>
    </article>
{:else}
    <button
        on:click|preventDefault
        type="button"
        class="card u-grid u-cross-center u-width-full-line dashed"
        class:common-section={single}>
        <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
            <div class="common-section">
                <Button secondary round>
                    <i class="icon-plus" />
                </Button>
            </div>
            <div class="common-section">
                <slot />
            </div>
        </div>
    </button>
{/if}
