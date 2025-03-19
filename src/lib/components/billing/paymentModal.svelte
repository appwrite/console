<script lang="ts">
    import { FakeModal } from '$lib/components';
    import { InputText, Button } from '$lib/elements/forms';
    import { createEventDispatcher, onMount } from 'svelte';
    import { initializeStripe, submitStripeCard } from '$lib/stores/stripe';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';
    import { Spinner } from '@appwrite.io/pink-svelte';

    export let show = false;

    const dispatch = createEventDispatcher();

    let name: string;
    let error: string;

    async function handleSubmit() {
        try {
            const card = await submitStripeCard(name, $page?.params?.organization ?? null);
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

    let isLoading = true;
    let element: HTMLElement;

    let observer: MutationObserver;

    onMount(() => {
        initializeStripe(element);
        observer = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    if (mutation.addedNodes.length > 0) {
                        for (let node of Array.from(mutation.addedNodes)) {
                            if (
                                node instanceof Element &&
                                node.className.toLowerCase().includes('__privatestripeelement')
                            ) {
                                isLoading = false;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            observer.disconnect();
        };
    });

    $: if (element) {
        observer.observe(element, { childList: true });
    }
</script>

<FakeModal bind:show title="Add payment method" bind:error onSubmit={handleSubmit}>
    <slot />
    <InputText
        id="name"
        required
        autofocus={true}
        bind:value={name}
        label="Cardholder name"
        placeholder="Cardholder name" />

    <div class="aw-stripe-container" data-private>
        {#if isLoading}
            <div class="loader-element">
                <Spinner />
            </div>
        {/if}

        <div class="stripe-element" bind:this={element}>
            <!-- Stripe will create form elements here -->
        </div>
    </div>
    <slot name="end"></slot>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!name}>Add</Button>
    </svelte:fragment>
</FakeModal>

<style lang="scss">
    .aw-stripe-container {
        display: flex;
        min-height: 245px;

        .stripe-element {
            width: 100%;
        }

        .loader-element {
            width: 100%;
            align-self: center;
            justify-items: end;
        }
    }
</style>
