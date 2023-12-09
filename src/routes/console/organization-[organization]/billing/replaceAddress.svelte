<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal, RadioBoxes } from '$lib/components';
    import { Button, FormItem, FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { Dependencies } from '$lib/constants';
    import { createEventDispatcher, onMount } from 'svelte';
    import type { AddressesList } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Pill } from '$lib/elements';

    const dispatch = createEventDispatcher();

    export let show = false;
    let addresses: AddressesList;
    let selectedAddress: string;
    let error: string;
    let taxId: string;
    let country: string;
    let streetAddress: string;
    let addressLine2: string;
    let city: string;
    let state: string;
    let postalCode: string;
    let options = [
        {
            value: 'US',
            label: 'United States'
        }
    ];
    onMount(async () => {
        addresses = await sdk.forConsole.billing.listAddresses();

        const firstNonCurrentAddress = addresses?.billingAddresses?.find(
            (address) => address.$id !== $organization?.billingAddressId
        );
        selectedAddress = addresses?.total
            ? firstNonCurrentAddress?.$id
                ? firstNonCurrentAddress?.$id
                : null
            : null;

        const locale = await sdk.forProject.locale.get();
        if (locale?.countryCode) {
            country = locale.countryCode;
        }
        const countryList = await sdk.forProject.locale.listCountries();
        options = countryList.countries.map((country) => {
            return {
                value: country.code,
                label: country.name
            };
        });
    });
    async function handleSubmit() {
        try {
            if (selectedAddress === $organization.billingAddressId) {
                show = false;
                return;
            } else if (selectedAddress === null) {
                const address = await sdk.forConsole.billing.createAddress(
                    country,
                    streetAddress,
                    city,
                    state,
                    postalCode,
                    addressLine2
                );
                dispatch('submit', address);
                invalidate(Dependencies.ORGANIZATION);
                trackEvent(Submit.OrganizationBillingAddressUpdate);
                addNotification({
                    type: 'success',
                    message: `Your billing address has been updated`
                });
                show = false;
                return;
            }
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationBillingAddressUpdate);
        }
    }

    $: if (!show) {
        selectedAddress = null;
    }
</script>

<Modal
    bind:show
    bind:error
    onSubmit={handleSubmit}
    size="big"
    headerDivider={false}
    title="Replace billing address">
    <p class="text">Replace the existing billing address for your organization.</p>
    {#if addresses?.total}
        <FormList>
            <RadioBoxes
                total={addresses?.total}
                name="payment"
                bind:group={selectedAddress}
                elements={addresses.billingAddresses}
                disabledCondition={$organization.billingAddressId}>
                <svelte:fragment slot="element" let:element>
                    <div class="u-flex u-gap-4" style="padding-inline:0.25rem">
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
                        {#if $organization.billingAddressId === element.$id}
                            <Pill>Current</Pill>
                        {/if}
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="new">
                    <span style="padding-inline:0.25rem">Add a new billing address</span>
                </svelte:fragment>
                <FormList gap={16} class="u-margin-block-start-24">
                    <InputText
                        bind:value={taxId}
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
        </FormList>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={selectedAddress === $organization.billingAddressId}>
            Save
        </Button>
    </svelte:fragment>
</Modal>
