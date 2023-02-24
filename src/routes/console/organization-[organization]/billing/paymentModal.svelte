<script lang="ts">
    // import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { InputText, Button, FormList, Label } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';

    import { publicKey } from './store';
    import {
        loadStripe,
        type PaymentMethod,
        type Stripe,
        type StripeElement,
        type StripeElements
    } from '@stripe/stripe-js';
    import { onMount } from 'svelte';
    import FormItem from '$lib/elements/forms/formItem.svelte';
    import { app } from '$lib/stores/app';
    import { organization } from '$lib/stores/organization';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let show = false;

    let name: string;
    let error: string;
    let isCreating = false;
    let elements: StripeElements;
    let cardElement: StripeElement;
    let cardNumber: HTMLDivElement;
    let stripe: Stripe;

    let paymentMethod;

    const styleLight = {
        base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: 'Inter, arial, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#c5c7d8'
            }
        },
        invalid: {
            color: '#FF4238',
            iconColor: '#FF4238'
        }
    };
    const styleDark = {
        base: {
            fontSize: '16px',
            color: '#C5C7D8',
            fontFamily: 'Inter, arial, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#606a7b'
            }
        },
        invalid: {
            color: '#FF4238',
            iconColor: '#FF4238'
        }
    };

    onMount(async () => {
        stripe = await loadStripe(publicKey);

        try {
            paymentMethod = await sdkForConsole.billing.createPaymentMethod($organization.$id);
            const options = {
                clientSecret: paymentMethod.clientSecret,
                // Fully customizable with appearance API.
                appearance: {
                    /*...*/
                }
            };
            // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
            elements = stripe.elements(options);
        } catch (error) {
            addNotification({
                message: error.toString(),
                type: 'error'
            });
        }
        createForm();
    });

    async function createForm() {
        cardElement = elements.create('card', {
            style: $app.themeInUse === 'dark' ? styleDark : styleLight
        });
        cardElement.mount(cardNumber);
    }

    async function handleSubmit() {
        const { error: StripeError } = await stripe.confirmSetup({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: 'http://localhost:3000'
            },
            redirect: 'if_required'
        });
        if (StripeError) {
            error = StripeError.message;
            // trackError(StripeError, Submit.ProjectCreate);
        } else {
            if (paymentMethod) {
                const { error: PaymentError, setupIntent } = await stripe.retrieveSetupIntent(
                    paymentMethod.clientSecret
                );
                if (PaymentError) {
                    error = PaymentError.message;
                    // trackError(StripeError, Submit.ProjectCreate);
                } else if (setupIntent && setupIntent.status === 'succeeded') {
                    //update payment method
                    await sdkForConsole.billing.updatePaymentMethod(
                        $organization.$id,
                        paymentMethod.$id,
                        setupIntent.payment_method as string
                    );
                    // const paymentElement = elements.getElement('payment');
                    // paymentElement.destroy();
                    await invalidate(Dependencies.PAYMENT_METHODS);
                }
            }
        }
    }
</script>

<Modal {error} on:submit={handleSubmit} size="big" bind:show>
    <svelte:fragment slot="header">Add Payment Method</svelte:fragment>
    This payment method will be added to the {$organization.name} billing details.
    <FormList>
        <InputText
            id="name"
            label="Cardholder name"
            placeholder="Cardholder name"
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
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isCreating}>Create</Button>
    </svelte:fragment>
</Modal>
