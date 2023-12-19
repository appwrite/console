<script lang="ts">
    import { Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import PaymentMethods from './paymentMethods.svelte';
    import BillingAddress from './billingAddress.svelte';

    let showPayment = false;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Payment details</Heading>
    </div>
    <PaymentMethods bind:showPayment />
    <BillingAddress />
</Container>
