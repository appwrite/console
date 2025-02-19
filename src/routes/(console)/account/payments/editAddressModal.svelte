<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormItem, FormList, InputSelect, InputText } from '$lib/elements/forms';
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
            .forProject($page.params.region, $page.params.project)
            .locale.listCountries();
        const locale = await sdk.forProject($page.params.region, $page.params.project).locale.get();
        if (locale.countryCode) {
            selectedAddress.country = locale.countryCode;
        }
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
            trackEvent(Submit.BillingAddressCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BillingAddressCreate);
        }
    }
</script>

<Modal bind:error bind:show onSubmit={handleSubmit} size="big" title="Update billing address">
    <FormList gap={16}>
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
        <FormItem isMultiple>
            <InputText
                isMultiple
                fullWidth
                bind:value={selectedAddress.state}
                id="state"
                label="State"
                placeholder="Enter your state"
                required />
            <InputText
                isMultiple
                fullWidth
                bind:value={selectedAddress.postalCode}
                id="zip"
                label="Postal code"
                placeholder="Enter postal code" />
        </FormItem>
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Save</Button>
    </svelte:fragment>
</Modal>
