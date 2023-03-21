<script lang="ts">
    // import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { paymentMethods, publicKey } from './store';
    import {
        loadStripe,
        type Stripe,
        type StripeElements,
        type PaymentMethod
    } from '@stripe/stripe-js';
    import { onMount } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { app } from '$lib/stores/app';

    export let show = false;

    let name: string;
    let error: string;
    let elements: StripeElements;
    let stripe: Stripe;

    let clientSecret: string;
    let paymentMethod: PaymentMethod;

    const apperanceLight = {
        variables: {
            colorPrimary: '#606a7b',
            colorText: '#373B4D',
            colorBackground: '#FFFFFF',
            color: '#606a7b',
            colorDanger: '#df1b41',
            fontFamily: 'Inter, arial, sans-serif',
            borderRadius: '4px'
        },
        rules: {
            '.Input:hover': {
                border: 'solid 1px #C4C6D7',
                boxShadow: 'none'
            },
            '.Input:focus': {
                border: 'solid 1px #C4C6D7',
                boxShadow: 'none'
            },
            '.Input::placeholder': {
                color: '#C4C6D7'
            },
            '.Input--invalid': {
                border: 'solid 1px var(--colorDanger)',
                boxShadow: 'none'
            }
        }
    };
    const apperanceDark = {
        variables: {
            colorPrimary: '#606a7b',
            colorText: '#C5C7D8',
            colorBackground: '#161622',
            colorDanger: '#FF453A',
            fontFamily: 'Inter, arial, sans-serif',
            borderRadius: '4px'
        },
        rules: {
            '.Input:hover': {
                border: 'solid 1px #4F5769',
                boxShadow: 'none'
            },
            '.Input:focus': {
                border: 'solid 1px #4F5769',
                boxShadow: 'none'
            },
            '.Input--invalid': {
                border: 'solid 1px var(--colorDanger)',
                boxShadow: 'none'
            }
        }
    };

    onMount(async () => {
        stripe = await loadStripe(publicKey);
        try {
            clientSecret = $paymentMethods?.paymentMethods[0]?.clientSecret;
            if (!clientSecret) {
                paymentMethod = await sdk.forConsole.billing.createPaymentMethod($organization.$id);
            }
            const options = {
                clientSecret: clientSecret ? clientSecret : paymentMethod.clientSecret,
                appearance: $app.themeInUse === 'dark' ? apperanceDark : apperanceLight
            };
            console.log(clientSecret);
            // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
            elements = stripe.elements(options);
            createForm();
        } catch (e) {
            error = e.message;
        }
    });

    async function createForm() {
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
    }

    async function handleSubmit() {
        try {
            await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: 'http://localhost:3000'
                },
                redirect: 'if_required'
            });
            paymentMethod = await sdk.forConsole.billing.createPaymentMethod($organization.$id);
            const { setupIntent } = await stripe.retrieveSetupIntent(paymentMethod.clientSecret);
            if (setupIntent && setupIntent.status === 'succeeded') {
                await sdk.forConsole.billing.updatePaymentMethod(
                    $organization.$id,
                    paymentMethod.$id,
                    setupIntent.payment_method as string
                );
                await invalidate(Dependencies.PAYMENT_METHODS);
                show = false;
                console.log('test');
                // const paymentElement = elements.getElement('payment');
                // paymentElement.destroy();
            } else console.log('test2');
        } catch (e) {
            error = e.message;
            console.log(e);
            // trackError(StripeError, Submit.ProjectCreate);
        }
    }
</script>

<Modal {error} onSubmit={handleSubmit} size="big" bind:show>
    <svelte:fragment slot="header">Add Payment Method</svelte:fragment>
    This payment method will be added to the {$organization.name} billing details.
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
        <p class="text u-small">
            You won’t be charged immediately. You will be charged for your plan on the first day of
            each month using the payment method you've specified above.
        </p>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Save</Button>
    </svelte:fragment>
</Modal>
