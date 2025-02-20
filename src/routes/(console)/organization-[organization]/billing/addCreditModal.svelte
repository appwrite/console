<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    export let show = false;
    let coupon: string = null;
    let error: string = null;

    async function redeem() {
        try {
            await sdk.forConsole.billing.addCredit($organization.$id, coupon);
            show = false;
            await invalidate(Dependencies.CREDIT);
            await invalidate(Dependencies.ORGANIZATION);
            addNotification({
                type: 'success',
                message: `Credit has been added to ${$organization.name}`
            });
            trackEvent(Submit.CreditRedeem, {
                coupon
            });
            coupon = null;
            dispatch('success');
        } catch (e) {
            error = e.message;
            trackError(e, Submit.CreditRedeem);
        }
    }
</script>

<Modal bind:show title="Add credits" headerDivider={false} onSubmit={redeem} size="big" bind:error>
    Apply Appwrite credits to your organization.

    <FormList>
        <InputText
            placeholder="Promo code"
            id="code"
            autofocus
            label="Add promo code"
            bind:value={coupon} />
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Add credits</Button>
    </svelte:fragment>
</Modal>
