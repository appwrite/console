<script lang="ts">
    import { Button, Helper, InputChoice, InputSelectSearch, InputText } from '$lib/elements/forms';
    import type { PaymentList, PaymentMethodData } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import { onMount } from 'svelte';
    import { Alert, Card, CreditCardBrandImage } from '..';
    import PaymentModal from './paymentModal.svelte';
    import { capitalize } from '$lib/helpers/string';

    export let methods: PaymentList;
    export let value: string;
    export let taxId = '';

    let showTaxId = false;
    let showPaymentModal = false;
    let input: HTMLInputElement;
    let error: string;

    function handleInvalid(event: Event) {
        event.preventDefault();

        if (input.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = input.validationMessage;
    }

    async function cardSaved(event: CustomEvent<PaymentMethodData>) {
        value = event.detail.$id;
        methods = await sdk.forConsole.billing.listPaymentMethods();
    }

    onMount(() => {
        if (methods?.total && methods.paymentMethods.some((method) => !!method?.last4)) {
            value = methods.paymentMethods[0].$id;
        }
    });

    $: filteredMethods = methods?.paymentMethods?.filter((method) => !!method?.last4);

    $: selectedPaymentMethod = methods?.paymentMethods?.find((method) => method.$id === value);
</script>

{#if filteredMethods?.length}
    {#if selectedPaymentMethod?.country?.toLowerCase() === 'in'}
        <Alert type="warning">
            <svelte:fragment slot="title">Indian credit or debit card-holders</svelte:fragment>
            To comply with RBI regulations in India, Appwrite will ask for verification to charge up
            to $150 USD on your payment method. We will never charge more than the cost of your plan
            and the resources you use, or your budget cap limit. For higher usage limits, please contact
            us.
        </Alert>
    {/if}
    <InputSelectSearch
        id="method"
        required
        label="Payment method"
        placeholder="Select payment method"
        bind:value
        options={filteredMethods.map((method) => {
            return {
                value: method.$id,
                label: `${capitalize(method.brand)} ending in ${method.last4}`,
                data: [method.brand]
            };
        })}
        interactiveOutput
        let:option={o}>
        <svelte:fragment slot="output" let:option={o}>
            <output class="input-text u-cursor-pointer">
                <span class="u-flex u-gap-16 u-flex-vertical">
                    <span class="u-flex u-gap-16">
                        <span class="u-flex u-cross-center u-gap-8" style="padding-inline:0.25rem">
                            <span>{o.label}</span>
                            <CreditCardBrandImage brand={o.data?.toString()} />
                        </span>
                    </span>
                </span>
            </output>
        </svelte:fragment>

        <span class="u-flex u-gap-16 u-flex-vertical">
            <span class="u-flex u-gap-16">
                <span class="u-flex u-cross-center u-gap-8" style="padding-inline:0.25rem">
                    <span>{o.label}</span>
                    <CreditCardBrandImage brand={o.data?.toString()} />
                </span>
            </span>
        </span>
        <svelte:fragment slot="listEnd">
            <Button text on:click={() => (showPaymentModal = true)}>
                <span class="icon-plus"></span>
                <span class="text">Add new payment method</span>
            </Button>
        </svelte:fragment>
    </InputSelectSearch>
{:else}
    <div>
        <input
            bind:this={input}
            on:invalid={handleInvalid}
            required
            class="u-hide"
            type="text"
            name="method"
            id="method" />
        <Card
            isDashed
            style="--p-card-padding:0.75rem; --p-card-bg-color: transparent; --p-card-border-radius: 0.5rem"
            isTile>
            <div class="u-flex u-main-space-between u-cross-center">
                <p>
                    <span class="icon-exclamation-circle"></span>
                    <span class="text">No saved payment methods</span>
                </p>
                <Button secondary on:click={() => (showPaymentModal = true)}>
                    <span class="icon-plus"></span> <span class="text">Add</span>
                </Button>
            </div>
        </Card>
        {#if error}
            <Helper class="u-position-relative" type="warning">{error}</Helper>
        {/if}
    </div>
{/if}

{#if showPaymentModal && isCloud && hasStripePublicKey}
    <PaymentModal bind:show={showPaymentModal} on:submit={cardSaved}>
        <svelte:fragment slot="end">
            <InputChoice
                type="checkbox"
                id="taxIdCheck"
                label="I'm purchasing as a business"
                fullWidth
                bind:value={showTaxId}>
                {#if showTaxId}
                    <div class="u-margin-block-start-8">
                        <InputText
                            id="taxId"
                            label="Tax ID"
                            autofocus
                            placeholder="Tax ID"
                            bind:value={taxId} />
                    </div>
                {/if}
            </InputChoice>
        </svelte:fragment>
    </PaymentModal>
{/if}
