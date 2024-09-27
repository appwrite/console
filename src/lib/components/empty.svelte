<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';
    import { Heading } from '.';
    import { trackEvent } from '$lib/actions/analytics';
    import { createEventDispatcher } from 'svelte';

    export let single = false;
    export let isCard = true;
    export let noMedia = false;
    export let target: string = null;
    export let href: string = null;
    export let marginTop = false;
    export let allowCreate = true;

    const dispatch = createEventDispatcher();

    function onClick(event) {
        if (!allowCreate) {
            return;
        }
        dispatch('click', event);
    }

    function track() {
        if (!allowCreate) {
            return;
        }
        if (target) {
            trackEvent(`click_create_${target}`, {
                from: 'empty'
            });
        }
    }
</script>

{#if single}
    <article class:card={isCard} class="u-grid u-cross-center u-width-full-line common-section">
        <div
            class="u-flex u-flex-vertical u-cross-center u-gap-24 u-width-full-line u-overflow-hidden u-padding-block-8">
            {#if !noMedia}
                <button
                    type="button"
                    on:click={track}
                    on:click={onClick}
                    aria-label="create {target}">
                    <slot name="empty-media">
                        {#if $app.themeInUse === 'dark'}
                            <img src={EmptyDark} alt="create" aria-hidden="true" height="242" />
                        {:else}
                            <img src={EmptyLight} alt="create" aria-hidden="true" height="242" />
                        {/if}
                    </slot>
                </button>
            {/if}
            <slot>
                <div class="u-text-center">
                    <Heading size="7" tag="h2" trimmed={false}>
                        Create a {target} to get started.
                    </Heading>
                    <p class="body-text-2 u-bold u-margin-block-start-4">
                        Need a hand? Learn more in our documentation.
                    </p>
                </div>
                <div class="u-flex u-flex-wrap u-gap-16 u-main-center">
                    <Button
                        external
                        {href}
                        text
                        event="empty_documentation"
                        ariaLabel="create {target}">Documentation</Button>
                    {#if allowCreate}
                        <Button secondary on:click on:click={track}>
                            Create {target}
                        </Button>
                    {/if}
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
        class:card={isCard}
        class="u-grid u-cross-center u-width-full-line dashed"
        class:common-section={marginTop}>
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
