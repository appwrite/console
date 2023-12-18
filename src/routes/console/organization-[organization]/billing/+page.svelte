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
    import { confirmPayment, initializeStripe, isStripeInitialized } from '$lib/stores/stripe';
    import { sdk } from '$lib/stores/sdk';
    import { toLocaleDate } from '$lib/helpers/date';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';

    $: defaultPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.paymentMethodId
    );

    $: backupPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.backupPaymentMethodId
    );

    onMount(async () => {
        if (
            $page.url.searchParams.has('type') &&
            $page.url.searchParams.get('type') === 'upgrade'
        ) {
            wizard.start(ChangeOrganizationTierCloud);
        }
        if ($page.url.searchParams.has('clientSecret')) {
            if (!$isStripeInitialized) {
                await initializeStripe();
            }
            const clientSecret = $page.url.searchParams.get('clientSecret');
            await confirmPayment($organization.$id, clientSecret, $organization.paymentMethodId);
        }
        if (
            $page.url.searchParams.has('invoice') &&
            $page.url.searchParams.has('type') &&
            $page.url.searchParams.get('type') === 'confirmation'
        ) {
            if (!$isStripeInitialized) {
                await initializeStripe();
            }
            const invoiceId = $page.url.searchParams.get('invoice');
            const invoice = await sdk.forConsole.billing.getInvoice(
                $page.params.organization,
                invoiceId
            );

            await confirmPayment(
                $organization.$id,
                invoice.clientSecret,
                $organization.paymentMethodId
            );
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
