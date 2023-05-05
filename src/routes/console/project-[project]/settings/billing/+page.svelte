<script lang="ts">
    import { Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import BudgetCap from './budgetCap.svelte';
</script>

<Container>
    <Heading tag="h2" size="5">Billing</Heading>
    <BudgetCap />
</Container>
