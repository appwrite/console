<script lang="ts">
    import { FormItem, FormList, InputRadio, InputSelect, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { changeOrganizationTier } from './store';
    import { organization } from '$lib/stores/organization';
    import type { AddressesList } from '$lib/sdk/billing';

    let options = [
        {
            value: 'US',
            label: 'United States'
        }
    ];
    let addressList: AddressesList;

    onMount(async () => {
        addressList = await sdk.forConsole.billing.listAddresses();
        $changeOrganizationTier.billingAddressId = $organization.billingAddressId
            ? $organization.billingAddressId
            : addressList.billingAddresses?.[0]?.$id ?? null;
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

    <p class="text u-margin-block-start-24"><b>Billing address</b></p>
    <FormList class="u-margin-block-start-8">
        <div class:boxes-wrapper={addressList?.total}>
            {#if addressList?.total}
                {#each addressList.billingAddresses as address}
                    <div class="box">
                        <InputRadio
                            id={`address-${address.$id}`}
                            value={address.$id}
                            name="address"
                            bind:group={$changeOrganizationTier.billingAddressId}>
                            <div
                                class="u-line-height-1-5 u-flex u-flex-vertical u-gap-2"
                                style="padding-inline:0.25rem">
                                <p class="text">{address.streetAddress}</p>
                                {#if address?.addressLine2}
                                    <p class="text">{address.addressLine2}</p>
                                {/if}
                                <p class="text">{address.city}</p>
                                <p class="text">{address.state}</p>
                                <p class="text">{address.postalCode}</p>
                                <p class="text">{address.country}</p>
                            </div>
                        </InputRadio>
                    </div>
                {/each}
            {/if}

            <div class="box">
                {#if addressList?.total}
                    <InputRadio
                        id="address"
                        value={null}
                        name="address"
                        bind:group={$changeOrganizationTier.billingAddressId}>
                        <span style="padding-inline:0.25rem">Add new billing address</span>
                    </InputRadio>
                {/if}
                {#if $changeOrganizationTier.billingAddressId === null}
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
                {/if}
            </div>
        </div>
    </FormList>
</WizardStep>
