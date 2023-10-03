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
    import { Alert, Heading } from '$lib/components';
    import { failedInvoice, paymentMethods } from '$lib/stores/billing';
    import type { PaymentMethodData } from '$lib/sdk/billing';

    $: defaultPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.paymentMethodId
    );

    $: backupPaymentMethod = $paymentMethods?.paymentMethods?.find(
        (method: PaymentMethodData) => method.$id === $organization?.backupPaymentMethodId
    );
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
    <BudgetCap />
    {#if $organization?.billingPlan !== 'tier-0' && !!$organization?.billingBudget}
        <BudgetAlert />
    {/if}
    <AvailableCredit />
</Container>
