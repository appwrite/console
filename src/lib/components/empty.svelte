<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';
    import { Heading } from '.';

    export let single = false;
    export let target: string = null;
    export let href: string = null;
</script>

{#if single}
    <article class="card u-grid u-cross-center u-width-full-line common-section">
        <div class="u-flex u-flex-vertical u-cross-center u-gap-24">
            <button type="button" on:click|preventDefault>
                {#if $app.themeInUse === 'dark'}
                    <img src={EmptyDark} alt="create" aria-hidden="true" />
                {:else}
                    <img src={EmptyLight} alt="create" aria-hidden="true" />
                {/if}
            </button>
            <slot>
                <div class="u-text-center">
                    <Heading size="7" tag="h4">Create your first {target} to get started.</Heading>
                    <p class="body-text-2 u-margin-block-start-4">
                        Need a hand? Check out our documentation.
                    </p>
                </div>
                <div class="u-flex u-gap-16 u-main-center">
                    <Button external {href} text>Documentation</Button>
                    <Button secondary on:click>Create {target}</Button>
                </div>
            </slot>
        </div>
    </article>
{:else}
    <button
        on:click|preventDefault
        type="button"
        class="card u-grid u-cross-center u-width-full-line dashed">
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
