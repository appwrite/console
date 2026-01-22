<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { states } from './state';
    import { Alert, Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { CreditCardBrandImage } from '../index.js';

    let {
        show = $bindable(false),
        paymentMethod
    }: {
        show: boolean;
        paymentMethod: PaymentMethodData;
    } = $props();

    let selectedState = $state('');
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);

    $: if (!show) {
        selectedState = '';
        error = null;
    }

    async function handleSubmit() {
        if (!selectedState) {
            error = 'Please select a state';
            return;
        }

        isSubmitting = true;
        error = null;

        try {
            await sdk.forConsole.billing.setPaymentMethod(
                paymentMethod.$id,
                paymentMethod.providerMethodId,
                paymentMethod.name,
                selectedState
            );
            trackEvent(Submit.PaymentMethodUpdate);
            await invalidate(Dependencies.PAYMENT_METHODS);
            addNotification({
                type: 'success',
                message: 'Payment method state has been updated'
            });
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.PaymentMethodUpdate);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Modal
    dismissible={false}
    bind:error
    onSubmit={handleSubmit}
    bind:show
    title="Update payment method state">
    <svelte:fragment slot="description">
        State information is required for US payment methods to apply correct taxes and meet U.S.
        legal requirements.
    </svelte:fragment>

    <Layout.Stack direction="column" gap="m">
        {#if paymentMethod}
            <Card.Base variant="secondary" padding="s">
                <Layout.Stack direction="row" alignItems="center" gap="s">
                    <CreditCardBrandImage brand={paymentMethod.brand} />
                    <span>ending in {paymentMethod.last4}</span>
                </Layout.Stack>
                <Typography.Text size="s">
                    {paymentMethod.country}
                </Typography.Text>
            </Card.Base>
        {/if}

        <Alert.Inline status="info" title="State is required for US payment methods">
            <Typography.Text size="s">
                To complete the billing information, select your state so we can apply the correct
                taxes and meet U.S. legal requirements.
            </Typography.Text>
        </Alert.Inline>

        <InputSelect
            bind:value={selectedState}
            required
            label="State"
            placeholder="Select a state"
            id="state-picker"
            options={states.map((stateOption) => ({
                label: stateOption.name,
                value: stateOption.abbreviation,
                id: stateOption.abbreviation.toLowerCase()
            }))} />
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button submit disabled={!selectedState || isSubmitting}>Save</Button>
    </svelte:fragment>
</Modal>
