<script lang="ts">
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { getCreditCardImage } from '$lib/stores/billing';
    import { Alert } from '.';

    export let isBox = false;
    export let paymentMethod: PaymentMethodData;
</script>

<div class:box={isBox}>
    <div class="u-flex u-main-space-between u-cross-start">
        <div class="u-line-height-1-5">
            <span class="u-flex u-cross-center u-gap-8">
                <p class="text u-bold">
                    <span class="u-capitalize">{paymentMethod?.brand}</span> ending in {paymentMethod?.last4}
                </p>
                <img
                    width="23"
                    height="16"
                    src={getCreditCardImage(paymentMethod?.brand)}
                    alt={paymentMethod?.brand} />
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
