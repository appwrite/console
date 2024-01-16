<script lang="ts">
    import { FormList, InputText } from '$lib/elements/forms';
    import { onDestroy, onMount } from 'svelte';
    import { CreditCardBrandImage, RadioBoxes } from '..';
    import { unmountPaymentElement } from '$lib/stores/stripe';

    export let methods: Record<string, unknown>[];
    export let group: string;
    export let name: string;

    let element: HTMLDivElement;
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
    });

    onDestroy(() => {
        observer.disconnect();
        unmountPaymentElement();
    });

    $: if (element) {
        observer.observe(element, { childList: true });
    }
</script>

<RadioBoxes elements={methods} total={methods?.length} variableName="$id" name="payment" bind:group>
    <svelte:fragment slot="element" let:element>
        <slot {element}>
            <span class="u-flex u-cross-center u-gap-8" style="padding-inline:0.25rem">
                <span>
                    <span class="u-capitalize">{element.brand}</span> ending in {element.last4}</span>
                <CreditCardBrandImage brand={element.brand?.toString()} />
            </span>
        </slot>
    </svelte:fragment>
    <svelte:fragment slot="new">
        <span style="padding-inline:0.25rem">Add new payment method</span>
    </svelte:fragment>

    <FormList class="u-margin-block-start-8" gap={16}>
        <InputText
            id="name"
            label="Cardholder name"
            placeholder="Cardholder name"
            bind:value={name}
            required
            autofocus={true} />

        <div class="aw-stripe-container" data-private>
            <div class="loader-container" bind:this={loader}>
                <div class="loader"></div>
            </div>
            <div id="payment-element" bind:this={element}>
                <!-- Stripe will create form elements here -->
            </div>
        </div>
    </FormList>
</RadioBoxes>

<style lang="scss">
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
