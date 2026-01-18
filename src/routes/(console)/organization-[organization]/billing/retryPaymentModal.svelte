<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { FakeModal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { page } from '$app/state';
    import {
        confirmPayment,
        isStripeInitialized,
        setPaymentMethod,
        submitStripeCard
    } from '$lib/stores/stripe';
    import { organization } from '$lib/stores/organization';
    import { toLocaleDate } from '$lib/helpers/date';
    import { PaymentBoxes } from '$lib/components/billing';
    import { paymentMethods } from '$lib/stores/billing';
    import { onMount } from 'svelte';
    import { getApiEndpoint, sdk } from '$lib/stores/sdk';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { resolve } from '$app/paths';
    import type { PaymentMethod as StripePaymentMethod } from '@stripe/stripe-js';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let invoice: Models.Invoice | null = null;

    let name: string;
    let state: string = '';
    let error: string = null;
    let setAsDefault = false;
    let isButtonDisabled = false;
    let paymentMethodId: string;
    let showState: boolean = false;
    let paymentMethod: StripePaymentMethod | null = null;

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
            if (paymentMethodId === null || paymentMethodId === '$new') {
                try {
                    if (showState && !state) {
                        throw Error('Please select a state');
                    }
                    let method: Models.PaymentMethod;
                    if (showState) {
                        method = await setPaymentMethod(paymentMethod.id, name, state);
                    } else {
                        const card = await submitStripeCard(name, $organization.$id);
                        // When Stripe returns an expanded PaymentMethod for US cards, we need state.
                        if (Object.hasOwn(card, 'id') && (card as StripePaymentMethod)?.card) {
                            if ((card as StripePaymentMethod).card?.country === 'US') {
                                paymentMethod = card as StripePaymentMethod;
                                showState = true;
                                return;
                            }
                        }

                        // Otherwise, we expect an Appwrite PaymentMethodData with `$id`.
                        if (Object.hasOwn(card, '$id')) {
                            method = card as Models.PaymentMethod;
                        }
                    }

                    const card = await sdk.forConsole.account.getPaymentMethod({
                        paymentMethodId: method.$id
                    });

                    if (card?.last4) {
                        paymentMethodId = card.$id;
                    } else {
                        throw new Error(
                            'The payment method you selected is not valid. Please select a different one.'
                        );
                    }

                    await invalidate(Dependencies.PAYMENT_METHODS);
                } catch (e) {
                    paymentMethodId = $organization.paymentMethodId;
                    error = e.message;
                }
            }

            if (setAsDefault) {
                await sdk.forConsole.organizations.setDefaultPaymentMethod({
                    organizationId: $organization.$id,
                    paymentMethodId
                });
            }

            const { clientSecret, status } =
                await sdk.forConsole.organizations.createInvoicePayment({
                    organizationId: $organization.$id,
                    invoiceId: invoice.$id,
                    paymentMethodId
                });

            if (status !== 'succeeded' && status !== 'cancelled') {
                // probably still pending, confirm via stripe!
                const resolvedUrl = resolve('/(console)/organization-[organization]/billing', {
                    organization: $organization.$id
                });

                await confirmPayment({
                    clientSecret,
                    paymentMethodId: paymentMethodId ?? $organization.paymentMethodId,
                    orgId: $organization.$id,
                    route: `${resolvedUrl}?type=validate-invoice&invoice=${invoice.$id}`
                });

                await sdk.forConsole.organizations.validateInvoice({
                    organizationId: $organization.$id,
                    invoiceId: invoice.$id
                });
            }

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

    $: filteredMethods = $paymentMethods?.paymentMethods.filter((method) => !!method?.last4);
    $: if (paymentMethodId) {
        isStripeInitialized.set(false);
    }
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
    title="Retry payment">
    <p class="text">
        Your payment of <span class="inline-tag">{formatCurrency(invoice.grossAmount)}</span> due on {toLocaleDate(
            invoice.dueAt
        )} has failed. Retry your payment to avoid service interruptions with your projects.
    </p>

    <Button
        external
        href={`${endpoint}/organizations/${page.params.organization}/invoices/${invoice.$id}/view`}>
        View invoice
    </Button>

    <PaymentBoxes
        bind:paymentMethod
        bind:showState
        bind:state
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
