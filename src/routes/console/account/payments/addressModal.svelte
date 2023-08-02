<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let show = false;

    //TODO: fetch countries from appwrite
    const options = [
        {
            value: 'US',
            label: 'United States'
        }
    ];
    let country: string;
    let address: string;
    let address2: string;
    let city: string;
    let state: string;
    let zip: number;

    async function handleSubmit() {
        try {
            await sdk.forConsole.billing.createAddress(
                country,
                address,
                address2,
                city,
                state,
                zip?.toString()
            );
            await invalidate(Dependencies.PAYMENT_METHODS);
            show = false;
            addNotification({
                type: 'success',
                message: `Address has been deleted`
            });
            trackEvent(Submit.BillingAddressDeleted);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BillingAddressDeleted);
        }
    }

    $: isButtonDisabled = !country || !address || !city || !state || !zip;
</script>

<Modal bind:show onSubmit={handleSubmit} size="big">
    <svelte:fragment slot="header">Add billing address</svelte:fragment>
    <InputSelect
        bind:value={country}
        {options}
        label="Country or region"
        placeholder="Select country or region"
        id="country"
        required />
    <InputText
        bind:value={address}
        id="address"
        label="Street address"
        placeholder="Enter street address"
        required />
    <InputText
        bind:value={address2}
        id="address2"
        label="Address line 2"
        placeholder="Unit number, floor, etc." />
    <InputText
        bind:value={city}
        id="city"
        label="City or suburb"
        placeholder="Enter your city"
        required />
    <InputText
        bind:value={state}
        id="state"
        label="State"
        placeholder="Enter your state"
        required />
    <InputNumber
        bind:value={zip}
        id="zip"
        label="Postal code"
        placeholder="Enter postal code"
        required />
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isButtonDisabled}>Save</Button>
    </svelte:fragment>
</Modal>
