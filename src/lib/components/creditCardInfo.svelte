<script lang="ts">
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { getCreditCardImage } from '$lib/stores/billing';

    export let isBox = false;
    export let paymentMethod: PaymentMethodData;
</script>

<div class:box={isBox} class="u-flex u-main-space-between u-cross-start">
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
        <!-- <p class="text">
            {paymentMethod?.name}
        </p> -->
    </div>

    <slot />
</div>
