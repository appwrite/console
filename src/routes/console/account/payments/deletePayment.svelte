<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    export let method: string;

    async function handleDelete() {
        try {
            await sdk.forConsole.billing.deletePaymentMethod(method);
            await invalidate(Dependencies.PAYMENT_METHODS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Payment method has been deleted`
            });
            trackEvent(Submit.PaymentMethodDeleted);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.PaymentMethodDeleted);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">Delete payment method</svelte:fragment>
    <p class="text">Are you sure you want to delete this payment method from your account?</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
