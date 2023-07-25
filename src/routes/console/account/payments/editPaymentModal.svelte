<script lang="ts">
    // import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, FormList } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { initializeStripe, updateStripeCard } from '$lib/stores/stripe';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';

    export let show = false;
    export let selectedPaymentMethod: string;
    let error: string;

    onMount(async () => {
        await initializeStripe();
    });

    async function handleSubmit() {
        try {
            await updateStripeCard(selectedPaymentMethod);
            show = false;
            addNotification({
                type: 'success',
                message: 'Your payment method has been updated'
            });
            invalidate(Dependencies.PAYMENT_METHODS);
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal bind:error onSubmit={handleSubmit} size="big" bind:show>
    <svelte:fragment slot="header">Update payment method</svelte:fragment>
    <FormList>
        <div id="payment-element">
            <!-- Elements will create form elements here -->
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Save</Button>
    </svelte:fragment>
</Modal>
