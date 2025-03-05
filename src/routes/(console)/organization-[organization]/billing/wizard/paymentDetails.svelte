<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { PaymentBoxes } from '$lib/components/billing';
    import { Dependencies } from '$lib/constants';
    import { FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { initializeStripe, isStripeInitialized, submitStripeCard } from '$lib/stores/stripe';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { addCreditWizardStore } from '../store';

    let methods: Models.PaymentMethodList;
    let name: string;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        $addCreditWizardStore.paymentMethodId =
            methods.paymentMethods.find((method) => !!method?.last4)?.$id ?? null;
    });

    async function handleSubmit() {
        try {
            const method = await submitStripeCard(name, $organization.$id);
            $addCreditWizardStore.paymentMethodId = method.$id;
            invalidate(Dependencies.PAYMENT_METHODS);
        } catch (e) {
            throw new Error('Something went wrong. Please try again.');
        }
    }

    $: if ($addCreditWizardStore.paymentMethodId === null && !$isStripeInitialized) {
        initializeStripe();
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
    <FormList class="u-margin-block-start-8">
        <PaymentBoxes
            methods={filteredMethods}
            bind:name
            bind:group={$addCreditWizardStore.paymentMethodId} />
    </FormList>
</WizardStep>
