<script lang="ts">
    import { Container } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import BudgetCap from './budgetCap.svelte';
    import PlanSummary from './planSummary.svelte';
    import BillingAddress from './billingAddress.svelte';
    import PaymentMethods from './paymentMethods.svelte';
    import AvailableCredit from './availableCredit.svelte';
    import PaymentHistory from './paymentHistory.svelte';
    import TaxId from './taxId.svelte';
    import { Alert, Heading } from '$lib/components';
    import { failedInvoice, paymentMethods, tierToPlan, upgradeURL } from '$lib/stores/billing';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { confirmPayment } from '$lib/stores/stripe';
    import { sdk } from '$lib/stores/sdk';
    import { toLocaleDate } from '$lib/helpers/date';
    import RetryPaymentModal from './retryPaymentModal.svelte';
    import { selectedInvoice, showRetryModal } from './store';
    import { Button } from '$lib/elements/forms';
    import { goto } from '$app/navigation';

    export let data;

    $: defaultPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.paymentMethodId
    );

    $: backupPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.backupPaymentMethodId
    );

    onMount(async () => {
        if ($page.url.searchParams.has('type')) {
            if ($page.url.searchParams.get('type') === 'upgrade') {
                goto($upgradeURL);
            }

            if (
                $page.url.searchParams.has('invoice') &&
                $page.url.searchParams.get('type') === 'confirmation'
            ) {
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

            if (
                $page.url.searchParams.has('invoice') &&
                $page.url.searchParams.get('type') === 'retry'
            ) {
                const invoiceId = $page.url.searchParams.get('invoice');
                const invoice = await sdk.forConsole.billing.getInvoice(
                    $page.params.organization,
                    invoiceId
                );
                selectedInvoice.set(invoice);
                showRetryModal.set(true);
            }
        }
        if ($page.url.searchParams.has('clientSecret')) {
            const clientSecret = $page.url.searchParams.get('clientSecret');
            await confirmPayment($organization.$id, clientSecret, $organization.paymentMethodId);
        }
    });
</script>

<Container>
    {#if $failedInvoice}
        {#if $failedInvoice?.lastError}
            <Alert type="error" class="common-section">
                The scheduled payment for {$organization.name} failed due to following error: {$failedInvoice.lastError}
                <svelte:fragment slot="buttons">
                    <Button
                        text
                        on:click={() => {
                            $selectedInvoice = $failedInvoice;
                            $showRetryModal = true;
                        }}>Try again</Button>
                </svelte:fragment>
            </Alert>
        {:else}
            <Alert type="error" class="common-section">
                <svelte:fragment slot="title">
                    The scheduled payment for {$organization.name} failed
                </svelte:fragment>
                To avoid service disruptions in organization's your projects, please verify your payment
                details and update them if necessary.
            </Alert>
        {/if}
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
            Your organization has changed to {tierToPlan($organization?.billingPlanDowngrade).name} plan.
            You will continue to have access to {tierToPlan($organization?.billingPlan).name} plan features
            until your billing period ends on {toLocaleDate($organization.billingNextInvoiceDate)}.
        </Alert>
    {/if}
    <div class="common-section">
        <Heading tag="h2" size="5">Billing</Heading>
    </div>
    <PlanSummary
        creditList={data?.creditList}
        currentPlan={data?.aggregationBillingPlan}
        currentAggregation={data?.billingAggregation}
        currentInvoice={data?.billingInvoice} />
    <PaymentHistory />
    <PaymentMethods />
    <BillingAddress billingAddress={data?.billingAddress} />
    <TaxId />
    <BudgetCap />
    <AvailableCredit />
</Container>

{#if $selectedInvoice}
    <RetryPaymentModal bind:show={$showRetryModal} bind:invoice={$selectedInvoice} />
{/if}
