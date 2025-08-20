<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import type { PaymentList, PaymentMethodData } from '$lib/sdk/billing';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isStripeInitialized, setPaymentMethod, submitStripeCard } from '$lib/stores/stripe';
    import { sdk } from '$lib/stores/sdk';
    import { PaymentBoxes } from '$lib/components/billing';
    import { addCreditWizardStore } from '../store';
    import { organization } from '$lib/stores/organization';
    import type { PaymentMethod } from '@stripe/stripe-js';

    let methods: PaymentList;
    let name: string;
    let showState: boolean = false;
    let state: string = '';
    let paymentMethod: PaymentMethod | null = null;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        $addCreditWizardStore.paymentMethodId =
            methods.paymentMethods.find((method) => !!method?.last4)?.$id ?? null;
    });

    async function handleSubmit() {
        try {
            if (showState && !state) {
                throw Error('Please select a state');
            }
            let method: PaymentMethodData;
            if (showState) {
                method = await setPaymentMethod(paymentMethod.id, name, state);
            } else {
                const card = await submitStripeCard(name, $organization.$id);
                if (card && Object.hasOwn(card, 'id')) {
                    if ((card as PaymentMethod).card.country === 'US') {
                        paymentMethod = card as PaymentMethod;
                        showState = true;
                        return;
                    }
                } else if (card && Object.hasOwn(card, '$id')) {
                    method = card as PaymentMethodData;
                }
            }
            $addCreditWizardStore.paymentMethodId = method.$id;
            invalidate(Dependencies.PAYMENT_METHODS);
        } catch (e) {
            throw new Error('Something went wrong. Please try again.');
        }
    }

    $: if ($addCreditWizardStore.paymentMethodId) {
        isStripeInitialized.set(false);
    }

    $: filteredMethods = methods?.paymentMethods.filter((method) => !!method?.last4);
</script>

<WizardStep beforeSubmit={handleSubmit}>
    <svelte:fragment slot="title">Details</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Add a payment method to your organization. You will not be charged until you upgrade to a
        Pro or Scale plan.
    </svelte:fragment>

    <p class="text"><b>Payment method</b></p>
    <PaymentBoxes
        bind:paymentMethod
        bind:showState
        bind:state
        methods={filteredMethods}
        bind:name
        bind:group={$addCreditWizardStore.paymentMethodId} />
</WizardStep>
