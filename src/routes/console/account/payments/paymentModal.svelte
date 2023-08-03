<script lang="ts">
    // import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { initializeStripe, submitStripeCard } from '$lib/stores/stripe';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';

    export let show = false;

    let name: string;
    let error: string;

    onMount(async () => {
        await initializeStripe();
    });

    async function handleSubmit() {
        try {
            await submitStripeCard(name);
            show = false;
            invalidate(Dependencies.PAYMENT_METHODS);
            addNotification({
                type: 'success',
                message: 'A new payment method has been added to your account'
            });
        } catch (e) {
            error = e.message;
            console.log(e.message);
        }
    }
</script>

<Modal bind:error onSubmit={handleSubmit} size="big" bind:show>
    <svelte:fragment slot="header">Add payment method</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Cardholder name"
            placeholder="Cardholder name"
            bind:value={name}
            required
            autofocus={true} />

        <div id="payment-element">
            <!-- Elements will create form elements here -->
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!name}>Save</Button>
    </svelte:fragment>
</Modal>
