<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { DropList, DropListItem } from '.';

    export let paymentMethod: PaymentMethodData;
    export let isEditDisabled = false;
    export let isDeleteDisabled = false;

    let showDropdown = false;
</script>

<div class="box u-flex u-main-space-between u-cross-start">
    <div>
        <p class="text">
            Card ending in {paymentMethod?.last4}
            <span>{paymentMethod?.brand}</span>
        </p>
        <p class="text">
            Expires {paymentMethod?.expiryMonth}/{paymentMethod?.expiryYear}
        </p>
        <p class="text">
            {paymentMethod?.name}
        </p>
    </div>

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
</div>
