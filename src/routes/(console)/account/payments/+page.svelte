<script lang="ts">
    import { Container } from '$lib/layout';
    import PaymentMethods from './paymentMethods.svelte';
    import BillingAddress from './billingAddress.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { confirmPayment } from '$lib/stores/stripe';
    import { Typography } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let showPayment = false;

    onMount(async () => {
        if (page.url.searchParams.has('clientSecret')) {
            const clientSecret = page.url.searchParams.get('clientSecret');
            const paymentMethodId = page.url.searchParams.get('paymentMethodId');
            await confirmPayment('', clientSecret, paymentMethodId);
        }
    });
</script>

<Container>
    <Typography.Title size="s">Payment details</Typography.Title>
    <PaymentMethods bind:showPayment />
    <BillingAddress {data} />
</Container>
