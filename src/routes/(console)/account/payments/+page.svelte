<script lang="ts">
    import { Container } from '$lib/layout';
    import PaymentMethods from './paymentMethods.svelte';
    import BillingAddress from './billingAddress.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { confirmPayment } from '$lib/stores/stripe';
    import { Typography } from '@appwrite.io/pink-svelte';

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
        <Typography.Title size="s">Payment details</Typography.Title>
    </div>
    <PaymentMethods bind:showPayment />
    <BillingAddress />
</Container>
