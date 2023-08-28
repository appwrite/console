<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { Alert } from '$lib/components';
    import { trackEvent } from '$lib/actions/analytics';
    import { Form } from '$lib/elements/forms';
    import { disableCommands } from '$lib/commandCenter';

    export let show = false;
    export let size: 'small' | 'big' = null;
    export let icon: string = null;
    export let state: 'success' | 'warning' | 'error' | 'info' = null;
    export let error: string = null;
    export let closable = true;
    export let headerDivider = true;
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };
    export let title = '';
    export let description = '';

    let dialog: HTMLDialogElement;
    let alert: HTMLElement;

    const dispatch = createEventDispatcher();

    onMount(() => {
        if (show) openModal();
    });

    onDestroy(() => {
        if (show) closeModal();
    });

    function handleBLur(event: MouseEvent) {
        if (event.target === dialog) {
            trackEvent('click_close_modal', {
                from: 'backdrop'
            });
            closeModal();
        }
    }
    function openModal() {
        if (dialog && !dialog.open) {
            dialog.showModal();
            document.documentElement.classList.add('u-overflow-hidden');
        }
    }

    function closeModal() {
        if (closable) {
            if (dialog && dialog.open) {
                dispatch('close');
                dialog.close();
                show = false;
                document.documentElement.classList.remove('u-overflow-hidden');
            }
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            trackEvent('click_close_modal', {
                from: 'escape'
            });
            closeModal();
        }
    }

    $: if (show) {
        openModal();
    } else {
        closeModal();
    }

    $: $disableCommands(show);

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
</script>

<svelte:window on:mousedown={handleBLur} on:keydown={handleKeydown} />

<dialog
    class="modal"
    class:is-small={size === 'small'}
    class:is-big={size === 'big'}
    class:is-separate-header={headerDivider}
    bind:this={dialog}
    on:cancel|preventDefault>
    {#if show}
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
                                <span class={`icon-${icon}`} aria-hidden="true" />
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
                                trackEvent('click_close_modal', {
                                    from: 'button'
                                })}
                            on:click={closeModal}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    {/if}
                </div>
                <p>
                    <slot name="description">
                        {description}
                    </slot>
                </p>
            </header>
            <div class="modal-content">
                {#if error}
                    <div bind:this={alert}>
                        <Alert
                            dismissible
                            type="warning"
                            on:dismiss={() => {
                                error = null;
                            }}>
                            {error}
                        </Alert>
                    </div>
                {/if}
                <slot />
            </div>

            {#if $$slots.footer}
                <div class="modal-footer">
                    <div class="u-flex u-main-end u-gap-16">
                        <slot name="footer" />
                    </div>
                </div>
            {/if}
        </Form>
    {/if}
</dialog>
