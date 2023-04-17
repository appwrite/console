<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';
    import { Heading } from '.';
    import { trackEvent } from '$lib/actions/analytics';

    export let single = false;
    export let target: string = null;
    export let href: string = null;

    function track() {
        if (target) {
            trackEvent(`click_create_${target}`, {
                from: 'empty'
            });
        }
    }
</script>

{#if single}
    <article class="card u-grid u-cross-center u-width-full-line common-section">
        <div
            class="u-flex u-flex-vertical u-cross-center u-gap-24 u-width-full-line u-overflow-hidden">
            <button
                type="button"
                on:click|preventDefault
                on:click={track}
                aria-label={`create {target}`}>
                {#if $app.themeInUse === 'dark'}
                    <img src={EmptyDark} alt="create" aria-hidden="true" height="124" width="215" />
                {:else}
                    <img
                        src={EmptyLight}
                        alt="create"
                        aria-hidden="true"
                        height="124"
                        width="215" />
                {/if}
            </button>
            <slot>
                <div class="u-text-center">
                    <Heading size="7" tag="h2" trimmed={false}>
                        Create your first {target} to get started.
                    </Heading>
                    <p class="body-text-2 u-bold u-margin-block-start-4">
                        Need a hand? Check out our documentation.
                    </p>
                </div>
                <div class="u-flex u-flex-wrap u-gap-16 u-main-center">
                    <Button
                        external
                        {href}
                        text
                        event="empty_documentation"
                        ariaLabel={`create {target}`}>Documentation</Button>
                    <Button secondary on:click on:click={track}>
                        Create {target}
                    </Button>
                </div>
            </slot>
        </div>
    </article>
{:else}
    <button
        on:click|preventDefault
        on:click={track}
        aria-label="create"
        type="button"
        class="card u-grid u-cross-center u-width-full-line dashed">
        <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
            <div class="common-section">
                <div class="button is-secondary is-only-icon">
                    <i class="icon-plus" />
                </div>
            </div>
            <div class="common-section">
                <slot />
            </div>
        </div>
    </button>
{/if}
