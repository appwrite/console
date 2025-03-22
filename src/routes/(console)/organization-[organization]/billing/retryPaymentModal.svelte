<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { FakeModal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';
    import type { Invoice } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { page } from '$app/stores';
    import {
        confirmPayment,
        initializeStripe,
        isStripeInitialized,
        submitStripeCard
    } from '$lib/stores/stripe';
    import { organization } from '$lib/stores/organization';
    import { toLocaleDate } from '$lib/helpers/date';
    import { PaymentBoxes } from '$lib/components/billing';
    import { paymentMethods } from '$lib/stores/billing';
    import { onMount } from 'svelte';
    import { getApiEndpoint, sdk } from '$lib/stores/sdk';
    import { formatCurrency } from '$lib/helpers/numbers';

    export let show = false;
    export let invoice: Invoice;
    let error: string = null;
    let isButtonDisabled = false;
    let name: string;
    let paymentMethodId: string;
    let setAsDefault = false;
    const endpoint = getApiEndpoint();

    onMount(async () => {
        if (!$organization.paymentMethodId && !$organization.backupPaymentMethodId) {
            paymentMethodId = $paymentMethods?.total ? $paymentMethods.paymentMethods[0].$id : null;
        } else {
            paymentMethodId = $organization.paymentMethodId
                ? $organization.paymentMethodId
                : $organization.backupPaymentMethodId;
            // If the selected payment method does not belong to the current user, select the first one.
            if (
                $paymentMethods?.total &&
                !$paymentMethods.paymentMethods.some((method) => method.$id === paymentMethodId)
            ) {
                paymentMethodId = $paymentMethods.paymentMethods[0].$id;
            }
        }
    });

    async function handleSubmit() {
        isButtonDisabled = true;
        try {
            if (paymentMethodId === null) {
                try {
                    const method = await submitStripeCard(name, $organization.$id);
                    const card = await sdk.forConsole.billing.getPaymentMethod(method.$id);
                    if (card?.last4) {
                        paymentMethodId = card.$id;
                    } else {
                        throw new Error(
                            'The payment method you selected is not valid. Please select a different one.'
                        );
                    }
                    invalidate(Dependencies.PAYMENT_METHODS);
                } catch (e) {
                    paymentMethodId = $organization.paymentMethodId;
                    error = e.message;
                }
            }
            if (setAsDefault) {
                await sdk.forConsole.billing.setDefaultPaymentMethod(paymentMethodId);
            }
            const { clientSecret } = await sdk.forConsole.billing.retryPayment(
                $organization.$id,
                invoice.$id,
                paymentMethodId
            );

            await confirmPayment(
                $organization.$id,
                clientSecret,
                paymentMethodId ? paymentMethodId : $organization.paymentMethodId
            );
            invalidate(Dependencies.ORGANIZATION);
            invalidate(Dependencies.INVOICES);

            trackEvent(Submit.RetryPayment);
            addNotification({
                type: 'success',
                message: `Payment has been successfully processed`
            });
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.RetryPayment);
        } finally {
            isButtonDisabled = false;
        }
    }

    $: if (paymentMethodId === null && !$isStripeInitialized) {
        initializeStripe();
    }

    $: if (paymentMethodId) {
        isStripeInitialized.set(false);
    }
    $: filteredMethods = $paymentMethods?.paymentMethods.filter((method) => !!method?.last4);

    $: if (!show) {
        invoice = null;
    }
</script>

<FakeModal
    bind:show
    bind:error
    state="warning"
    onSubmit={handleSubmit}
    size="big"
    headerDivider={false}
    title="Retry payment">
    <!-- TODO: format currency -->
    <p class="text">
        Your payment of <span class="inline-tag">{formatCurrency(invoice.grossAmount)}</span> due on {toLocaleDate(
            invoice.dueAt
        )} has failed. Retry your payment to avoid service interruptions with your projects.
    </p>

    <Button
        external
        link
        href={`${endpoint}/organizations/${$page.params.organization}/invoices/${invoice.$id}/view`}>
        View invoice
    </Button>

    <PaymentBoxes
        methods={filteredMethods}
        defaultMethod={$organization?.paymentMethodId}
        backupMethod={$organization?.backupPaymentMethodId}
        bind:setAsDefault
        bind:name
        bind:group={paymentMethodId} />
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={isButtonDisabled}>Retry</Button>
    </svelte:fragment>
</FakeModal>
