<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSelect, InputText } from '$lib/elements/forms';
    import type { Address } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    export let show = false;
    export let selectedAddress: Address;

    let error: string = null;
    let options = [
        {
            value: 'US',
            label: 'United States'
        }
    ];

    onMount(async () => {
        const countryList = await sdk
            .forProject(page.params.region, page.params.project)
            .locale.listCountries();
        options = countryList.countries.map((country) => {
            return {
                value: country.code,
                label: country.name
            };
        });
    });

    async function handleSubmit() {
        try {
            await sdk.forConsole.billing.updateAddress(
                selectedAddress.$id,
                selectedAddress.country,
                selectedAddress.streetAddress,
                selectedAddress.city,
                selectedAddress.state,
                selectedAddress.postalCode ? selectedAddress.postalCode : undefined,
                selectedAddress.addressLine2 ? selectedAddress.addressLine2 : undefined
            );
            await invalidate(Dependencies.ADDRESS);
            show = false;
            addNotification({
                type: 'success',
                message: `Address has been added`
            });
            trackEvent(Submit.BillingAddressUpdate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BillingAddressUpdate);
        }
    }

    /**
     * This component isn't a modal, so it mounts with its parent.
     * On mount, `selectedAddress` can be `null`, so we set the country when the modal shows.
     *
     * And we only run this if the selected address has no country set,
     * which really shouldn't happen, but here we are, playing it safe!
     */
    $: if (show && !selectedAddress.country) {
        sdk.forProject(page.params.region, page.params.project)
            .locale.get()
            .then((locale) => {
                if (locale.countryCode) {
                    selectedAddress.country = locale.countryCode;
                }
            });
    }
</script>

<Modal bind:error bind:show onSubmit={handleSubmit} size="m" title="Update billing address">
    <InputSelect
        bind:value={selectedAddress.country}
        {options}
        label="Country or region"
        placeholder="Select country or region"
        id="country"
        required />
    <InputText
        bind:value={selectedAddress.streetAddress}
        id="address"
        label="Street address"
        placeholder="Enter street address"
        required />
    <InputText
        bind:value={selectedAddress.addressLine2}
        id="address2"
        label="Address line 2"
        placeholder="Unit number, floor, etc." />
    <InputText
        bind:value={selectedAddress.city}
        id="city"
        label="City or suburb"
        placeholder="Enter your city"
        required />
    <InputText
        bind:value={selectedAddress.state}
        id="state"
        label="State"
        placeholder="Enter your state"
        required />
    <InputText
        bind:value={selectedAddress.postalCode}
        id="zip"
        label="Postal code"
        placeholder="Enter postal code" />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Save</Button>
    </svelte:fragment>
</Modal>
