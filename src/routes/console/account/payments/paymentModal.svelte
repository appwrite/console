<script lang="ts">
    import { FakeModal } from '$lib/components';
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
            invalidate(Dependencies.PAYMENT_METHODS);
            show = false;
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

<FakeModal bind:show title="Add payment method" bind:error onSubmit={handleSubmit}>
    <FormList gap={16}>
        <InputText
            id="name"
            label="Cardholder name"
            placeholder="Cardholder name"
            bind:value={name}
            required
            autofocus={true}
            hideRequired />

        <div id="payment-element">
            <!-- Elements will create form elements here -->
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!name}>Save</Button>
    </svelte:fragment>
</FakeModal>
