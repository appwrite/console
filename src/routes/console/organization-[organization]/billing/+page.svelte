<script lang="ts">
    import { Container } from '$lib/layout';
    import BudgetCap from './budgetCap.svelte';
    import AvailableCredit from './availableCredit.svelte';
    import BillingAddress from './billingAddress.svelte';
    import PaymentHistory from './paymentHistory.svelte';
    import PaymentMethods from './paymentMethods.svelte';
    import PaymentModal from './paymentModal.svelte';
    import PaymentSummary from './paymentSummary.svelte';

    let showPayment = false;
</script>

<Container>
    <PaymentSummary />
    <PaymentHistory />
    <PaymentMethods bind:showPayment />
    <BillingAddress />
    <AvailableCredit />
    <BudgetCap />
</Container>

{#if showPayment}
    <PaymentModal bind:show={showPayment} />
{/if}
