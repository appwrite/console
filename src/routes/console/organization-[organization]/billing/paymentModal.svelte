<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { InputText, Button, FormList, Label } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';

    import { publicKey } from './stripe';
    import { loadStripe } from '@stripe/stripe-js';
    import { onMount } from 'svelte';
    import FormItem from '$lib/elements/forms/formItem.svelte';
    import { app } from '$lib/stores/app';

    export let show = false;

    let name: string;
    let error: string;
    let isCreating = false;
    let stripe;
    let elements;
    let cardNumber: HTMLDivElement;
    let cardExpiry: HTMLDivElement;
    let complete = false;
    const appearance = {
        theme: $app.themeInUse === 'dark' ? 'stripe' : 'stripe',
        variables: {
            colorPrimary: $app.themeInUse === 'dark' ? '#ffffff' : '#000000'
        }
    };
    let paymentIntent;
    let clientSecret;

    onMount(async () => {
        stripe = await loadStripe(publicKey);
        elements = stripe.elements(appearance);
        // paymentIntent = await createIntent();
        // clientSecret = paymentIntent.client_secret;
        createForm();
    });

    async function createForm() {
        const cardElement = elements.create('cardNumber', {
            style: {
                base: {
                    height: '40px',
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });
        cardElement.mount(cardNumber);

        // cardElement.on('change', (e) => (complete = e.complete));

        // const cardExpiry = elements.create('cardExpiry');
        // cardExpiry.mount(cardExpiry);
    }

    async function handleSubmit() {
        try {
            isCreating = true;

            trackEvent(Submit.ProjectCreate);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
        } catch (e) {
            isCreating = false;
            error = e.message;
            trackError(e, Submit.ProjectCreate);
        }
    }

    $: if (show) {
        createForm();
    }
</script>

<Modal {error} on:submit={handleSubmit} size="big" bind:show>
    <svelte:fragment slot="header">Add Payment Method</svelte:fragment>
    This payment method will be added to the Acme Org billing details.
    <FormList>
        <InputText
            id="name"
            label="Cardholder name"
            bind:value={name}
            required
            autofocus={true}
            disabled={isCreating} />
        <FormItem>
            <div class="input-text-wrapper">
                <Label required for="cardnumber">Card number</Label>
                <div class="input-text" bind:this={cardNumber} />
            </div>
        </FormItem>
        <FormItem>
            <div class="input-text-wrapper">
                <Label required for="cardnumber">Card expiry</Label>
                <div bind:this={cardExpiry} />
            </div>
        </FormItem>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isCreating}>Create</Button>
    </svelte:fragment>
</Modal>
