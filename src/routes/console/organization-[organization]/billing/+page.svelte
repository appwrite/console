<script lang="ts">
    import { Container } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import PaymentModal from '$routes/console/account/payments/paymentModal.svelte';
    import BudgetAlert from './budgetAlert.svelte';
    import BudgetCap from './budgetCap.svelte';
    // import AvailableCredit from './availableCredit.svelte';
    // import BillingAddress from './billingAddress.svelte';
    // import PaymentHistory from './paymentHistory.svelte';
    // import PaymentMethods from './paymentMethods.svelte';

    // import PaymentSummary from './paymentSummary.svelte';

    let showPayment = false;
</script>

<Container>
    <!-- <PaymentSummary />
    <PaymentHistory />
    <PaymentMethods bind:showPayment />
    <BillingAddress />
    <AvailableCredit /> -->
    <BudgetCap />
    {#if $organization?.billingPlan !== 'tier-2'}
        <BudgetAlert />
    {/if}
</Container>

{#if showPayment}
    <PaymentModal bind:show={showPayment} />
{/if}
