<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';

    export let isButton = false;
    export let single = false;
</script>

{#if isButton}
    <button
        on:click
        class="card u-grid u-cross-center u-width-full-line dashed"
        class:common-section={single}>
        {#if single}
            <div class="u-flex u-flex-vertical u-cross-center">
                {#if $app.themeInUse === 'dark'}
                    <img src={EmptyDark} alt="create" aria-hidden="true" />
                {:else}
                    <img src={EmptyLight} alt="create" aria-hidden="true" />
                {/if}
                <slot />
            </div>
        {:else}
            <div class="u-flex u-cross-center u-flex-vertical">
                <div class="common-section">
                    <Button secondary round>
                        <i class="icon-plus" />
                    </Button>
                </div>
                <div class="common-section">
                    <slot />
                </div>
            </div>
        {/if}
    </button>
{:else}
    <article class="card u-grid u-cross-center u-width-full-line" class:common-section={single}>
        {#if single}
            <div class="u-flex u-flex-vertical u-cross-center">
                {#if $app.themeInUse === 'dark'}
                    <img src={EmptyDark} alt="create" aria-hidden="true" />
                {:else}
                    <img src={EmptyLight} alt="create" aria-hidden="true" />
                {/if}
                <slot />
            </div>
        {:else}
            <div class="common-section">
                <Button secondary round>
                    <i class="icon-plus" />
                </Button>
            </div>
            <div class="common-section">
                <slot />
            </div>
        {/if}
    </article>
{/if}
