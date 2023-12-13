<script lang="ts">
    import { FakeModal } from '$lib/components';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { initializeStripe, submitStripeCard } from '$lib/stores/stripe';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';

    export let show = false;

    const dispatch = createEventDispatcher();

    let name: string;
    let error: string;

    onMount(async () => {
        await initializeStripe();
    });

    async function handleSubmit() {
        try {
            const card = await submitStripeCard(name);
            invalidate(Dependencies.PAYMENT_METHODS);
            dispatch('submit', card);
            show = false;
            addNotification({
                type: 'success',
                message: 'A new payment method has been added to your account'
            });
        } catch (e) {
            error = e.message;
        }
    }

    let element: HTMLElement;
    let loader: HTMLDivElement;

    let observer: MutationObserver;

    onMount(() => {
        observer = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    if (mutation.addedNodes.length > 0) {
                        for (let node of Array.from(mutation.addedNodes)) {
                            if (
                                node instanceof Element &&
                                node.className.toLowerCase().includes('__privatestripeelement')
                            ) {
                                loader.style.display = 'none';
                            }
                        }
                    }
                }
            }
        });

        observer.observe(element, { childList: true });
    });

    onDestroy(() => {
        observer.disconnect();
        document.documentElement.classList.remove('u-overflow-hidden');
    });
</script>

<FakeModal bind:show title="Add payment method" bind:error onSubmit={handleSubmit}>
    <FormList gap={16}>
        <InputText
            id="name"
            label="Cardholder name"
            placeholder="Cardholder name"
            bind:value={name}
            required
            autofocus={true}
            hideRequired />
        <div class="aw-stripe-container" data-private>
            <div class="loader-container" bind:this={loader}>
                <div class="loader"></div>
            </div>
            <div id="payment-element" bind:this={element}>
                <!-- Stripe will create form elements here -->
            </div>
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!name}>Save</Button>
    </svelte:fragment>
</FakeModal>

<style lang="scss" global>
    .aw-stripe-container {
        min-height: 295px;
        position: relative;
        .loader-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
        }
    }
</style>
