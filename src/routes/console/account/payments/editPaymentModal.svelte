<script lang="ts">
    // import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, FormList, InputNumber, InputSelect } from '$lib/elements/forms';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let show = false;
    export let selectedPaymentMethod: string;

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
                selectedPaymentMethod,
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

<Modal bind:error onSubmit={handleSubmit} size="big" bind:show>
    <svelte:fragment slot="header">Update payment method</svelte:fragment>
    <FormList>
        <InputSelect
            id="month"
            label="Month"
            bind:value={month}
            {options}
            required
            placeholder="Select expiry month" />
        <InputNumber
            id="year"
            label="Year"
            bind:value={year}
            required
            placeholder="Select expiry year" />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Update</Button>
    </svelte:fragment>
</Modal>
