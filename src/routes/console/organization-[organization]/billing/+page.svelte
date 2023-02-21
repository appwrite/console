<script>
    import { Container } from '$lib/layout';
    import AvailableCredit from './availableCredit.svelte';
    import BillingAddress from './billingAddress.svelte';
    import PaymentHistory from './paymentHistory.svelte';
    import PaymentMethods from './paymentMethods.svelte';
    import PaymentSummary from './paymentSummary.svelte';
</script>

<Container>
    <PaymentSummary />
    <PaymentHistory />
    <PaymentMethods />
    <BillingAddress />
    <AvailableCredit />
</Container>
