<script lang="ts">
    import { Container } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import BudgetAlert from './budgetAlert.svelte';
    import BudgetCap from './budgetCap.svelte';
    import PlanSummary from './planSummary.svelte';
    import BillingAddress from './billingAddress.svelte';
    import PaymentMethods from './paymentMethods.svelte';
    import AvailableCredit from './availableCredit.svelte';
    import PaymentHistory from './paymentHistory.svelte';
    import TaxId from './taxId.svelte';
    import { Alert, Heading } from '$lib/components';
    import { failedInvoice, paymentMethods } from '$lib/stores/billing';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { initializeStripe, isStripeInitialized, stripe } from '$lib/stores/stripe';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { toLocaleDate } from '$lib/helpers/date';

    $: defaultPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.paymentMethodId
    );

    $: backupPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.backupPaymentMethodId
    );

    onMount(async () => {
        if (
            ($page.url.searchParams.has('invoice') &&
                $page.url.searchParams.has('type') &&
                $page.url.searchParams.get('type') === 'confirmation') ||
            $page.url.searchParams.has('clientSecret')
        ) {
            if (!$isStripeInitialized) {
                await initializeStripe();
            }
            try {
                const invoiceId = $page.url.searchParams.get('invoice');
                console.log(invoiceId);
                const invoice = await sdk.forConsole.billing.getInvoice(
                    $page.params.organization,
                    invoiceId
                );
                console.log(invoice);
                const { setupIntent, error } = await $stripe.confirmCardSetup(
                    invoice.clientSecret,
                    {
                        payment_method: $organization.paymentMethodId,
                        return_url: `${base}/console/organization-${$organization.$id}/billing`
                    }
                );
                console.log('error', error);
                if (error) {
                    console.log('Something went wrong');
                }
                if (setupIntent.status === 'succeeded') {
                    if (typeof setupIntent.payment_method === 'string') {
                        await sdk.forConsole.billing.setOrganizationPaymentMethod(
                            $page.params.organization,
                            setupIntent.payment_method
                        );
                    } else {
                        await sdk.forConsole.billing.setOrganizationPaymentMethod(
                            $page.params.organization,
                            setupIntent.payment_method.id
                        );
                    }
                    addNotification({
                        title: 'Success',
                        message: 'Your payment method has been updated',
                        type: 'success'
                    });
                }
            } catch (error) {
                console.log(error);
                addNotification({
                    title: 'Error',
                    message:
                        'There was an error processing your payment, try again later. If the problem persists, please contact support.',
                    type: 'error'
                });
            }
        }
    });
</script>

<Container>
    {#if $failedInvoice}
        <Alert type="error" class="common-section">
            <svelte:fragment slot="title">
                The scheduled payment for {$organization.name} failed
            </svelte:fragment>
            To avoid service disruptions in organization's your projects, please verify your payment
            details and update them if necessary.
        </Alert>
    {/if}
    {#if defaultPaymentMethod?.failed && !backupPaymentMethod}
        <Alert type="error" class="common-section">
            <svelte:fragment slot="title">
                The default payment method for {$organization.name} has expired
            </svelte:fragment>
            To avoid service disruptions in your organization's projects, please update your payment
            details.
        </Alert>
    {/if}
    {#if $organization?.billingPlanDowngrade}
        <Alert type="info" class="common-section">
            Your organization will change to a Starter plan once your current billing cycle ends on {toLocaleDate(
                $organization.billingNextInvoiceDate
            )}.
        </Alert>
    {/if}
    <div class="common-section">
        <Heading tag="h2" size="5">Billing</Heading>
    </div>
    <PlanSummary />
    <PaymentHistory />
    <PaymentMethods />
    <BillingAddress />
    <TaxId />
    <BudgetCap />
    {#if $organization?.billingPlan !== 'tier-0' && !!$organization?.billingBudget}
        <BudgetAlert />
    {/if}
    <AvailableCredit />
</Container>
