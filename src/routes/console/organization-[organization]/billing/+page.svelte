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
</script>

<Container>
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
