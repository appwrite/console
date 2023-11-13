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
    import { isStripeInitialized, stripe } from '$lib/stores/stripe';
    import { base } from '$app/paths';

    $: defaultPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.paymentMethodId
    );

    $: backupPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.backupPaymentMethodId
    );

    onMount(async () => {
        if (
            $isStripeInitialized &&
            $page.url.searchParams.has('invoice') &&
            $page.url.searchParams.has('type') &&
            $page.url.searchParams.get('type') === 'confirmation'
        ) {
            console.log('test');
            console.log($page.url.searchParams.get('invoice'));
            const { error } = await $stripe.confirmPayment({
                confirmParams: {
                    // Return URL where the customer should be redirected after the PaymentIntent is confirmed.
                    return_url: `${base}/console/organization-${$organization.$id}/billing`,
                    payment_method: $organization.paymentMethodId
                }
            });
            if (error) {
                console.log('Something went wrong');
            }
        }
    });
</script>

<Container>
    {#if $failedInvoice}
        <Alert type="error">
            <svelte:fragment slot="title">
                The scheduled payment for {$organization.name} failed
            </svelte:fragment>
            To avoid service disruptions in your projects, please verify your payment details and update
            them if necessary.
        </Alert>
    {:else if defaultPaymentMethod?.failed && !backupPaymentMethod}
        <Alert type="error">
            <svelte:fragment slot="title">
                The default payment method for {$organization.name} has expired
            </svelte:fragment>
            To avoid service disruptions in your projects, please update your payment details.
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
