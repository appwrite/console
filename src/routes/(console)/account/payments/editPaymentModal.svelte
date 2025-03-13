<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, FormList, InputNumber, InputSelect } from '$lib/elements/forms';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let selectedPaymentMethod: PaymentMethodData;
    export let isLinked = false;
    const currentYear = new Date().getFullYear();
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
            trackEvent(Submit.PaymentMethodUpdate);
            invalidate(Dependencies.PAYMENT_METHODS);
            show = false;
            addNotification({
                type: 'success',
                message: 'Your payment method has been updated'
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.PaymentMethodUpdate);
        }
    }

    function createMonthOptions(year: number) {
        const months = [
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
        if (!year) return months;
        if (year === currentYear) {
            const currentMonth = new Date().getMonth() + 1;
            return months.filter((option) => parseInt(option.value) >= currentMonth);
        } else {
            return months;
        }
    }

    $: options = createMonthOptions(year);
</script>

<Modal bind:error onSubmit={handleSubmit} bind:show title="Update payment method">
    {#if selectedPaymentMethod?.expired}
        <Alert.Inline status="error" title="This payment method has expired" />
    {/if}
    <svelte:fragment slot="description">
        {#if isLinked}
            Updates to this payment method will be applied to any linked organizations.
        {/if}
    </svelte:fragment>
    <FormList>
        <InputSelect
            id="month"
            label="Month"
            bind:value={month}
            {options}
            required
            placeholder="Enter expiry month" />
        <InputNumber
            id="year"
            label="Year"
            bind:value={year}
            min={currentYear}
            required
            placeholder="Enter expiry year" />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!month || !year}>Update</Button>
    </svelte:fragment>
</Modal>
