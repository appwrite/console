<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { getCreditCardImage } from '$lib/stores/billing';
    import { DropList, DropListItem } from '.';

    export let isBox = false;
    export let paymentMethod: PaymentMethodData;
    export let isEditDisabled = false;
    export let isDeleteDisabled = false;

    let showDropdown = false;
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

    <slot>
        <DropList bind:show={showDropdown} placement="bottom-start" noArrow>
            <Button
                round
                text
                ariaLabel="More options"
                on:click={() => {
                    showDropdown = !showDropdown;
                }}>
                <span class="icon-dots-horizontal" aria-hidden="true" />
            </Button>
            <svelte:fragment slot="list">
                <DropListItem
                    icon="pencil"
                    disabled={isEditDisabled}
                    on:click={() => {
                        console.log('test');
                    }}>
                    Edit
                </DropListItem>
                <DropListItem
                    icon="trash"
                    disabled={isDeleteDisabled}
                    on:click={() => {
                        console.log('test');
                    }}>
                    Delete
                </DropListItem>
            </svelte:fragment>
        </DropList>
    </slot>
</div>
