<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import type { Address } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    export let selectedAddress: Address;
    let error: string = null;

    async function handleDelete() {
        try {
            console.log(selectedAddress);
            await sdk.forConsole.billing.deleteAddress(selectedAddress.$id);
            await invalidate(Dependencies.PAYMENT_METHODS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Address has been deleted`
            });
            trackEvent(Submit.BillingAddressDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BillingAddressDelete);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}
    title="Delete billing address"
    bind:error>
    <p class="text">Are you sure you want to delete this billing address from your account?</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
