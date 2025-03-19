<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    export let show = false;
    export let organization: string = null;

    let country: string;
    let address: string;
    let address2: string;
    let city: string;
    let state: string;
    let zip: string;
    let options = [
        {
            value: 'US',
            label: 'United States'
        }
    ];
    let error: string = null;

    onMount(async () => {
        const countryList = await sdk.forProject.locale.listCountries();
        const locale = await sdk.forProject.locale.get();
        if (locale.countryCode) {
            country = locale.countryCode;
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
            const response = await sdk.forConsole.billing.createAddress(
                country,
                address,
                city,
                state,
                zip ? zip : undefined,
                address2 ? address2 : undefined
            );
            trackEvent(Submit.BillingAddressCreate);
            let org: Organization = null;
            if (organization) {
                org = await sdk.forConsole.billing.setBillingAddress(organization, response.$id);
                trackEvent(Submit.OrganizationBillingAddressUpdate);
                await invalidate(Dependencies.ORGANIZATION);
            }
            await invalidate(Dependencies.ADDRESS);

            show = false;
            addNotification({
                type: 'success',
                message: org?.name
                    ? `A new billing address has been added to ${org.name}`
                    : `Address has been added`
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BillingAddressCreate);
        }
    }

    $: isButtonDisabled = !country || !address || !city || !state;
</script>

<Modal bind:show bind:error onSubmit={handleSubmit} size="m" title="Add billing address">
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
    <InputText bind:value={zip} id="zip" label="Postal code" placeholder="Enter postal code" />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isButtonDisabled}>Save</Button>
    </svelte:fragment>
</Modal>
