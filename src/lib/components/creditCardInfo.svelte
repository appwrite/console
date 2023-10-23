<script lang="ts">
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { Alert } from '.';
    import CreditCardBrandImage from './creditCardBrandImage.svelte';

    export let isBox = false;
    export let paymentMethod: PaymentMethodData;
</script>

<div class:box={isBox}>
    <div class="u-flex u-main-space-between u-cross-start">
        <div class="u-line-height-1-5 u-flex u-flex-vertical u-gap-2">
            <span class="u-flex u-cross-center u-gap-8">
                <p class="text u-bold">
                    <span class="u-capitalize">{paymentMethod?.brand}</span> ending in {paymentMethod?.last4}
                </p>
                <CreditCardBrandImage brand={paymentMethod?.brand} />
            </span>
            <p class="text">
                Expires {paymentMethod?.expiryMonth}/{paymentMethod?.expiryYear}
            </p>
            <!-- TODO: add card owner name when in SDK 
                <p class="text">
                    {paymentMethod?.name}
                </p> -->
        </div>

        <slot />
    </div>
    {#if paymentMethod?.expired}
        <Alert type="error" class="u-margin-block-start-16 u-width-full-line">
            <svelte:fragment slot="title">This payment method has expired</svelte:fragment>
        </Alert>
    {/if}
</div>
