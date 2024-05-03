<script lang="ts">
    import { Button, InputSelectSearch } from '$lib/elements/forms';
    import type { PaymentList, PaymentMethodData } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import PaymentModal from '$routes/console/account/payments/paymentModal.svelte';
    import { onMount } from 'svelte';
    import { Card, CreditCardBrandImage } from '..';

    export let methods: PaymentList;
    export let value: string;

    let showPaymentModal = false;

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
</script>

{#if filteredMethods?.length}
    <InputSelectSearch
        id="method"
        label="Payment method"
        bind:value
        options={filteredMethods.map((method) => {
            return {
                value: method.$id,
                label: `ending in ${method.last4}`,
                data: [method.brand]
            };
        })}
        interactiveOutput
        let:option={o}>
        <span class="u-flex u-gap-16 u-flex-vertical">
            <span class="u-flex u-gap-16">
                <span class="u-flex u-cross-center u-gap-8" style="padding-inline:0.25rem">
                    <span> <span class="u-capitalize">{o.data}</span> {o.label}</span>
                    <CreditCardBrandImage brand={o.data?.toString()} />
                </span>
            </span>
        </span>
    </InputSelectSearch>
{:else}
    <Card isDashed style="--p-card-padding: 1rem; --p-card-bg-color: transparent" isTile>
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
{/if}

{#if showPaymentModal && isCloud && hasStripePublicKey}
    <PaymentModal bind:show={showPaymentModal} on:submit={cardSaved} />
{/if}
