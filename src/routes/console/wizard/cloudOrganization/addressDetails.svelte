<script lang="ts">
    import { FormItem, FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { createOrganization } from './store';
    import type { AddressesList } from '$lib/sdk/billing';
    import { RadioBoxes } from '$lib/components';

    let options = [
        {
            value: 'US',
            label: 'United States'
        }
    ];
    let addressList: AddressesList;
    let country: string;
    let streetAddress: string;
    let city: string;
    let state: string;
    let postalCode: string;
    let addressLine2: string;

    async function handleAddress() {
        if (!$createOrganization.billingAddressId) {
            try {
                const response = await sdk.forConsole.billing.createAddress(
                    country,
                    streetAddress,
                    city,
                    state,
                    postalCode ? postalCode : undefined,
                    addressLine2 ? addressLine2 : undefined
                );
                $createOrganization.billingAddressId = response.$id;
            } catch (error) {
                throw new Error(error.message);
            }
        }
    }

    onMount(async () => {
        addressList = await sdk.forConsole.billing.listAddresses();
        $createOrganization.billingAddressId = addressList.billingAddresses?.[0]?.$id ?? null;
        const countryList = await sdk.forProject.locale.listCountries();
        const locale = await sdk.forProject.locale.get();
        if (locale?.countryCode) {
            country = locale.countryCode;
        }
        options = countryList.countries.map((country) => {
            return {
                value: country.code,
                label: country.name
            };
        });
    });
</script>

<WizardStep beforeSubmit={handleAddress}>
    <svelte:fragment slot="title">Billing address</svelte:fragment>
    <svelte:fragment slot="subtitle">Add a billing address for your organization.</svelte:fragment>

    <FormList class="u-margin-block-start-8">
        {#if addressList}
            <RadioBoxes
                total={addressList?.total}
                name="address"
                bind:group={$createOrganization.billingAddressId}
                elements={addressList.billingAddresses}>
                <svelte:fragment slot="element" let:element>
                    <div
                        class="u-line-height-1-5 u-flex u-flex-vertical u-gap-2"
                        style="padding-inline:0.25rem">
                        <p class="text">{element.streetAddress}</p>
                        {#if element?.addressLine2}
                            <p class="text">{element.addressLine2}</p>
                        {/if}
                        <p class="text">{element.city}</p>
                        <p class="text">{element.state}</p>
                        <p class="text">{element.postalCode}</p>
                        <p class="text">{element.country}</p>
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="new">
                    <span style="padding-inline:0.25rem">Add new billing address</span>
                </svelte:fragment>

                <FormList gap={16} class="u-margin-block-start-24">
                    <InputText
                        bind:value={$createOrganization.taxId}
                        id="text"
                        label="Tax ID"
                        placeholder="Enter tax ID"
                        optionalText="(optional)" />
                    <InputSelect
                        bind:value={country}
                        {options}
                        label="Country or region"
                        placeholder="Select country or region"
                        id="country"
                        required />
                    <InputText
                        bind:value={streetAddress}
                        id="address"
                        label="Street address"
                        placeholder="Enter street address"
                        required />
                    <InputText
                        bind:value={addressLine2}
                        id="address2"
                        label="Address line 2"
                        placeholder="Unit number, floor, etc." />
                    <InputText
                        bind:value={city}
                        id="city"
                        label="City or suburb"
                        placeholder="Enter your city"
                        required />
                    <FormItem isMultiple>
                        <InputText
                            isMultiple
                            fullWidth
                            bind:value={state}
                            id="state"
                            label="State"
                            placeholder="Enter your state"
                            required />
                        <InputText
                            isMultiple
                            fullWidth
                            bind:value={postalCode}
                            id="zip"
                            label="Postal code"
                            placeholder="Enter postal code" />
                    </FormItem>
                </FormList>
            </RadioBoxes>
        {/if}
    </FormList>
</WizardStep>
