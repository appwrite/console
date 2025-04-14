<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import type { Coupon } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    export let show = false;
    let error: string = null;
    let coupon: string = '';
    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };

    async function addCoupon() {
        try {
            const response = await sdk.forConsole.billing.getCouponAccount(coupon);
            couponData = response;
            dispatch('validation', couponData);
            coupon = null;
            show = false;
            addNotification({
                type: 'success',
                message: 'Credits applied successfully'
            });
        } catch (e) {
            error = e.message;
        }
    }

    $: if (coupon) {
        error = null;
    }
</script>

<Modal
    bind:show
    title="Add credits"
    headerDivider={false}
    onSubmit={addCoupon}
    size="big"
    bind:error>
    Credits will be applied automatically to your next invoice.

    <FormList>
        <InputText placeholder="Promo code" id="code" label="Add promo code" bind:value={coupon} />
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Add</Button>
    </svelte:fragment>
</Modal>
