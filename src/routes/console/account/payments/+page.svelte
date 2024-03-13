<script lang="ts">
    import { Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import PaymentMethods from './paymentMethods.svelte';
    import BillingAddress from './billingAddress.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { confirmPayment } from '$lib/stores/stripe';

    let showPayment = false;

    onMount(async () => {
        if ($page.url.searchParams.has('clientSecret')) {
            const clientSecret = $page.url.searchParams.get('clientSecret');
            const paymentMethodId = $page.url.searchParams.get('paymentMethodId');
            await confirmPayment('', clientSecret, paymentMethodId);
        }
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Payment details</Heading>
    </div>
    <PaymentMethods bind:showPayment />
    <BillingAddress />
</Container>
