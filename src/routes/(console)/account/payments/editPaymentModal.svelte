<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert } from '@appwrite.io/pink-svelte';

    let {
        show = $bindable(false),
        isLinked = false,
        selectedPaymentMethod
    }: {
        show: boolean;
        isLinked?: boolean;
        selectedPaymentMethod: PaymentMethodData;
    } = $props();

    let year: number | null = $state(null);
    let month: string | null = $state(null);
    let error: string | null = $state(null);

    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => {
        const value = String(i + 1).padStart(2, '0');
        return { value, label: value };
    });

    const options = $derived(createMonthOptions(year));

    async function handleSubmit() {
        try {
            await sdk.forConsole.billing.updatePaymentMethod(
                selectedPaymentMethod.$id,
                month,
                year?.toString()
            );
            show = false;
            trackEvent(Submit.PaymentMethodUpdate);
            await invalidate(Dependencies.PAYMENT_METHODS);
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
        if (!year) return months;
        if (year === currentYear) {
            const currentMonth = new Date().getMonth() + 1;
            return months.filter((option) => parseInt(option.value) >= currentMonth);
        } else {
            return months;
        }
    }
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

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!month || !year}>Update</Button>
    </svelte:fragment>
</Modal>
