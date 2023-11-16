<script lang="ts">
    import { FormItem, FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Alert } from '$lib/components';
    import { changeOrganizationTier, currentBillingAddress } from './store';
    import { organization } from '$lib/stores/organization';
    import { deepClone } from '$lib/helpers/object';

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

        if ($organization.billingAddressId) {
            $currentBillingAddress = await sdk.forConsole.billing.getAddress(
                $organization.billingAddressId
            );
            $changeOrganizationTier.billingAddress = deepClone($currentBillingAddress);
        }
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
            bind:value={$changeOrganizationTier.taxId}
            id="text"
            label="Tax ID"
            placeholder="Enter tax ID"
            optionalText="(optional)" />
        <InputSelect
            bind:value={$changeOrganizationTier.billingAddress.country}
            {options}
            label="Country or region"
            placeholder="Select country or region"
            id="country"
            required />
        <InputText
            bind:value={$changeOrganizationTier.billingAddress.streetAddress}
            id="address"
            label="Street address"
            placeholder="Enter street address"
            required />
        <InputText
            bind:value={$changeOrganizationTier.billingAddress.addressLine2}
            id="address2"
            label="Address line 2"
            placeholder="Unit number, floor, etc." />
        <InputText
            bind:value={$changeOrganizationTier.billingAddress.city}
            id="city"
            label="City or suburb"
            placeholder="Enter your city"
            required />
        <FormItem isMultiple>
            <InputText
                isMultiple
                fullWidth
                bind:value={$changeOrganizationTier.billingAddress.state}
                id="state"
                label="State"
                placeholder="Enter your state"
                required />
            <InputText
                isMultiple
                fullWidth
                bind:value={$changeOrganizationTier.billingAddress.postalCode}
                id="zip"
                label="Postal code"
                placeholder="Enter postal code"
                required />
        </FormItem>
    </FormList>
</WizardStep>
