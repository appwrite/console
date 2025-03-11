<script lang="ts">
    import { InputChoice, InputText } from '$lib/elements/forms';
    import { onDestroy, onMount } from 'svelte';
    import { CreditCardBrandImage } from '..';
    import { initializeStripe, unmountPaymentElement } from '$lib/stores/stripe';
    import { Badge, Card, Layout } from '@appwrite.io/pink-svelte';
    import type { PaymentMethodData } from '$lib/sdk/billing';

    export let methods: PaymentMethodData[];
    export let group: string;
    export let name: string;
    export let defaultMethod: string = null;
    export let backupMethod: string = null;
    export let disabledCondition: string = null;
    export let setAsDefault = false;
    export let showSetAsDefault = false;

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
        initializeStripe();
        observer.observe(element, { childList: true });
    }

    //Set setAsDefault as false when group changes
    $: if (group || group === '$new') {
        setAsDefault = false;
    }
</script>

<Layout.Stack>
    {#each methods as method}
        {@const value = method.$id.toString()}
        <Card.Selector
            title={method.name}
            name={value}
            bind:group
            {value}
            disabled={disabledCondition ? value === disabledCondition : false}>
            <svelte:fragment slot="actions">
                {#if method.$id === backupMethod}
                    <Badge variant="secondary" content="Backup" />
                {:else if method.$id === defaultMethod}
                    <Badge variant="secondary" content="Default" />
                {/if}
            </svelte:fragment>
            <Layout.Stack direction="row" alignItems="center" gap="s">
                {method.brand} ending in {method.last4}
                <CreditCardBrandImage brand={method.brand?.toString()} />
            </Layout.Stack>
        </Card.Selector>
    {/each}
    <Card.Selector title="Add new payment method" name="$new" bind:group value="$new" />
    {#if group === '$new'}
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
        {#if showSetAsDefault}
            <ul>
                <InputChoice
                    bind:value={setAsDefault}
                    id="default"
                    label="Set as default payment method for this organization" />
            </ul>
        {/if}
    {/if}
</Layout.Stack>

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
