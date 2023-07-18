<script lang="ts">
    import { Container } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import BudgetAlert from './budgetAlert.svelte';
    import BudgetCap from './budgetCap.svelte';
    import PaymentSummary from './paymentSummary.svelte';
    import BillingAddress from './billingAddress.svelte';
    import PaymentMethods from './paymentMethods.svelte';
</script>

<Container>
    <PaymentSummary />
    <PaymentMethods />
    <BillingAddress />
    <BudgetCap />
    {#if $organization?.billingPlan === 'tier-2'}
        <BudgetAlert />
    {/if}
</Container>
