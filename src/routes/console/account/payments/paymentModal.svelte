<script lang="ts">
    import { Alert } from '$lib/components';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { initializeStripe, submitStripeCard } from '$lib/stores/stripe';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import Form from '$lib/elements/forms/form.svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let show = false;

    let name: string;
    let error: string;
    let backdrop: HTMLDivElement;

    onMount(async () => {
        document.body.appendChild(backdrop);
        await initializeStripe();
    });

    async function handleSubmit() {
        try {
            await submitStripeCard(name);
            show = false;
            invalidate(Dependencies.PAYMENT_METHODS);
            closeModal();
            addNotification({
                type: 'success',
                message: 'A new payment method has been added to your account'
            });
        } catch (e) {
            error = e.message;
            console.log(e.message);
        }
    }

    function handleBLur(event: MouseEvent) {
        if (event.target === backdrop) {
            trackEvent('click_close_modal', {
                from: 'backdrop'
            });
            closeModal();
        }
    }

    function closeModal() {
        if (show) {
            show = false;
            document.documentElement.classList.remove('u-overflow-hidden');
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
        document.documentElement.classList.add('u-overflow-hidden');
    } else {
        closeModal();
        error = null;
    }
</script>

<svelte:window on:keydown={handleKeydown} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="payment-modal-backdrop"
    on:keyup={clickOnEnter}
    on:click={handleBLur}
    bind:this={backdrop}>
    <div class="modal is-big payment-modal">
        <Form isModal onSubmit={handleSubmit}>
            <header class="modal-header">
                <div class="u-flex u-main-space-between u-cross-center u-gap-16">
                    <div class="u-flex u-cross-center u-gap-16">
                        <h4 class="modal-title heading-level-5">Add payment method</h4>
                    </div>
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
                </div>
            </header>
            <div class="modal-content">
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
                <FormList gap={16}>
                    <InputText
                        id="name"
                        label="Cardholder name"
                        placeholder="Cardholder name"
                        bind:value={name}
                        required
                        autofocus={true}
                        hideRequired />

                    <div id="payment-element">
                        <!-- Elements will create form elements here -->
                    </div>
                </FormList>
            </div>

            <div class="modal-footer">
                <div class="u-flex u-main-end u-gap-16">
                    <Button secondary on:click={() => (show = false)}>Cancel</Button>
                    <Button submit disabled={!name}>Save</Button>
                </div>
            </div>
        </Form>
    </div>
</div>

<style lang="scss">
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
        :global() {
            background-color: hsl(240 5% 8% / 0.6);
        }
    }
</style>
