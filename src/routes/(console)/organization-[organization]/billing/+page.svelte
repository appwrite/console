<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Alert, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { failedInvoice, paymentMethods, tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import AvailableCredit from './availableCredit.svelte';
    import BillingAddress from './billingAddress.svelte';
    import BudgetAlert from './budgetAlert.svelte';
    import BudgetCap from './budgetCap.svelte';
    import PaymentHistory from './paymentHistory.svelte';
    import PaymentMethods from './paymentMethods.svelte';
    import PlanSummary from './planSummary.svelte';
    import RetryPaymentModal from './retryPaymentModal.svelte';
    import { selectedInvoice, showRetryModal } from './store';
    import TaxId from './taxId.svelte';

    export let data;

    $: defaultPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: Models.PaymentMethod) => method.$id === $organization?.paymentMethodId
    );

    $: backupPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: Models.PaymentMethod) => method.$id === $organization?.backupPaymentMethodId
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
                const invoice = await sdk.forConsole.organizations.getInvoice(
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
                const invoice = await sdk.forConsole.organizations.getInvoice(
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
    <BudgetAlert />
    <AvailableCredit />
</Container>

{#if $selectedInvoice}
    <RetryPaymentModal bind:show={$showRetryModal} bind:invoice={$selectedInvoice} />
{/if}
