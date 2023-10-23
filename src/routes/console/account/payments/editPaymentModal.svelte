<script lang="ts">
    // import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Alert, Modal } from '$lib/components';
    import { Button, FormItem, FormList, InputNumber, InputSelect } from '$lib/elements/forms';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { PaymentMethodData } from '$lib/sdk/billing';

    export let show = false;
    export let selectedPaymentMethod: PaymentMethodData;
    export let isLinked = false;

    const options = [
        { value: '01', label: '01' },
        { value: '02', label: '02' },
        { value: '03', label: '03' },
        { value: '04', label: '04' },
        { value: '05', label: '05' },
        { value: '06', label: '06' },
        { value: '07', label: '07' },
        { value: '08', label: '08' },
        { value: '09', label: '09' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' }
    ];

    let error: string;
    let month: string;
    let year: number;

    async function handleSubmit() {
        try {
            await sdk.forConsole.billing.updatePaymentMethod(
                selectedPaymentMethod.$id,
                month,
                year?.toString()
            );
            addNotification({
                type: 'success',
                message: 'Your payment method has been updated'
            });
            invalidate(Dependencies.PAYMENT_METHODS);
            show = false;
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal
    bind:error
    onSubmit={handleSubmit}
    size="big"
    bind:show
    title="Update payment method"
    headerDivider={false}>
    {#if selectedPaymentMethod?.expired}
        <Alert type="error">
            <svelte:fragment slot="title">This payment method has expired</svelte:fragment>
        </Alert>
    {/if}
    {#if isLinked}
        Updates to this payment method will be applied to any linked organizations.
    {/if}
    <FormList>
        <FormItem isMultiple>
            <InputSelect
                isMultiple
                fullWidth
                id="month"
                label="Month"
                bind:value={month}
                {options}
                required
                placeholder="Select expiry month" />
            <InputNumber
                isMultiple
                fullWidth
                id="year"
                label="Year"
                bind:value={year}
                required
                placeholder="Select expiry year" />
        </FormItem>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!month || !year}>Update</Button>
    </svelte:fragment>
</Modal>
