<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Alert } from '.';
    import CreditCardBrandImage from './creditCardBrandImage.svelte';

    export let isBox = false;
    export let paymentMethod: Models.PaymentMethod;
</script>

<div class:box={isBox}>
    <div class="u-flex u-main-space-between u-cross-start" style="padding-block: 0.5rem;">
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
            {#if paymentMethod?.name}
                <p class="text">
                    {paymentMethod.name}
                </p>
            {/if}
        </div>

        <slot />
    </div>
    {#if paymentMethod?.expired}
        <Alert type="error" class="u-margin-block-start-16 u-width-full-line">
            <svelte:fragment slot="title">This payment method has expired</svelte:fragment>
        </Alert>
    {/if}
    {#if paymentMethod?.lastError}
        <Alert type="error" class="u-margin-block-start-16 u-width-full-line">
            {paymentMethod.lastError}
        </Alert>
    {/if}
</div>
