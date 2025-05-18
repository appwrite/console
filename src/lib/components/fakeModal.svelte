<script lang="ts">
    import { Alert } from '$lib/components';
    import { onMount } from 'svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let show = false;
    export let size: 'small' | 'big' = 'big';
    export let icon: string = null;
    export let state: 'success' | 'warning' | 'error' | 'info' = null;
    export let error: string = null;
    export let closable = true;
    export let headerDivider = true;
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };
    export let title = '';

    let backdrop: HTMLDivElement;

    onMount(async () => {});

    function handleBLur(event: MouseEvent) {
        if (event.target === backdrop) {
            trackEvent(Click.ModalCloseClick, {
                from: 'backdrop'
            });
            closeModal();
        }
    }

    function closeModal() {
        document.documentElement.classList.remove('u-overflow-hidden');
        show = false;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            trackEvent(Click.ModalCloseClick, {
                from: 'escape'
            });
            closeModal();
        }
    }

    $: if (backdrop && show && !document.body.contains(backdrop)) {
        document.body.appendChild(backdrop);
    }

    $: if (show) {
        document.documentElement.classList.add('u-overflow-hidden');
    } else {
        closeModal();
        error = null;
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="payment-modal-backdrop"
        on:keyup={clickOnEnter}
        on:click={handleBLur}
        bind:this={backdrop}>
        <div
            class="modal"
            class:is-small={size === 'small'}
            class:is-big={size === 'big'}
            class:is-separate-header={headerDivider}>
            <Form isModal {onSubmit}>
                <header class="modal-header">
                    <div class="u-flex u-main-space-between u-cross-center u-gap-16">
                        <div class="u-flex u-cross-center u-gap-16">
                            {#if icon}
                                <div
                                    class="avatar is-medium"
                                    class:is-success={state === 'success'}
                                    class:is-warning={state === 'warning'}
                                    class:is-danger={state === 'error'}
                                    class:is-info={state === 'info'}>
                                    <span class={`icon-${icon}`} aria-hidden="true"></span>
                                </div>
                            {/if}

                            <h4 class="modal-title heading-level-5">
                                <slot name="title">
                                    {title}
                                </slot>
                            </h4>
                        </div>
                        {#if closable}
                            <button
                                type="button"
                                class="button is-text is-only-icon"
                                style="--button-size:1.5rem;"
                                aria-label="Close Modal"
                                title="Close Modal"
                                on:click={() =>
                                    trackEvent(Click.ModalCloseClick, {
                                        from: 'button'
                                    })}
                                on:click={closeModal}>
                                <span class="icon-x" aria-hidden="true"></span>
                            </button>
                        {/if}
                    </div>
                </header>
                <div class="modal-content">
                    <div class="modal-content-spacer u-flex-vertical u-gap-24 u-width-full-line">
                        {#if error}
                            <Alert
                                dismissible
                                type="warning"
                                on:dismiss={() => {
                                    error = null;
                                }}>
                                {error}
                            </Alert>
                        {/if}
                        <slot />
                    </div>
                </div>

                {#if $$slots.footer}
                    <div class="modal-footer">
                        <div class="u-flex u-main-end u-gap-16">
                            <slot name="footer" />
                        </div>
                    </div>
                {/if}
            </Form>
        </div>
    </div>
{/if}

<style lang="scss" global>
    .payment-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100000;
        width: 100%;
        height: 100%;
        background-color: hsl(240 22% 10% / 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: hsl(240 5% 8% / 0.6);

        & :global(.modal-form) {
            position: unset;
        }
    }
</style>
