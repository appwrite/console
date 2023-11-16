<script lang="ts">
    import { FormItem, FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Alert } from '$lib/components';
    import { createOrganization } from './store';

    let options = [
        {
            value: 'US',
            label: 'United States'
        }
    ];

    onMount(async () => {
        const countryList = await sdk.forProject.locale.listCountries();
        options = countryList.countries.map((country) => {
            return {
                value: country.code,
                label: country.name
            };
        });
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Billing address</svelte:fragment>
    <svelte:fragment slot="subtitle">Add a billing address for your organization.</svelte:fragment>

    <Alert type="info">
        Depending on your location, your billing address might need to be in the same country
        associated with the payment method for your organization.
    </Alert>
    <FormList gap={16} class="u-margin-block-start-24">
        <InputText
            bind:value={$createOrganization.taxId}
            id="text"
            label="Tax ID"
            placeholder="Enter tax ID"
            optionalText="(optional)" />
        <InputSelect
            bind:value={$createOrganization.billingAddress.country}
            {options}
            label="Country or region"
            placeholder="Select country or region"
            id="country"
            required />
        <InputText
            bind:value={$createOrganization.billingAddress.address}
            id="address"
            label="Street address"
            placeholder="Enter street address"
            required />
        <InputText
            bind:value={$createOrganization.billingAddress.address2}
            id="address2"
            label="Address line 2"
            placeholder="Unit number, floor, etc." />
        <InputText
            bind:value={$createOrganization.billingAddress.city}
            id="city"
            label="City or suburb"
            placeholder="Enter your city"
            required />
        <FormItem isMultiple>
            <InputText
                isMultiple
                fullWidth
                bind:value={$createOrganization.billingAddress.state}
                id="state"
                label="State"
                placeholder="Enter your state"
                required />
            <InputText
                isMultiple
                fullWidth
                bind:value={$createOrganization.billingAddress.postalCode}
                id="zip"
                label="Postal code"
                placeholder="Enter postal code"
                required />
        </FormItem>
    </FormList>
</WizardStep>
