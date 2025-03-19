<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputText } from '$lib/elements/forms';
    import type { Coupon } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let isNewOrg = false;
    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };
    let error: string = null;
    let coupon: string = '';
    const dispatch = createEventDispatcher();

    async function addCoupon() {
        try {
            const response = await sdk.forConsole.billing.getCoupon(coupon);

            if (response.onlyNewOrgs && !isNewOrg) {
                show = false;
                addNotification({
                    type: 'error',
                    message: 'Coupon only valid for new organizations'
                });
            } else {
                couponData = response;
                dispatch('validation', couponData);
                coupon = null;
                show = false;
                addNotification({
                    type: 'success',
                    message: 'Credits applied successfully'
                });
            }
        } catch (e) {
            error = e.message;
        }
    }

    $: if (coupon) {
        error = null;
    }
</script>

<Modal bind:show title="Add credits" onSubmit={addCoupon} bind:error>
    <svelte:fragment slot="description">
        Credits will be applied automatically to your next invoice.
    </svelte:fragment>

    <InputText
        required
        placeholder="Promo code"
        id="code"
        label="Add promo code"
        bind:value={coupon} />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={coupon === ''}>Add</Button>
    </svelte:fragment>
</Modal>
