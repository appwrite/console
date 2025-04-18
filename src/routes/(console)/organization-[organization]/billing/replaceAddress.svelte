<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button, InputSelect, InputText } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { Dependencies } from '$lib/constants';
    import { onMount } from 'svelte';
    import type { AddressesList } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { Alert, Badge, Card, Layout, Skeleton } from '@appwrite.io/pink-svelte';

    export let show = false;
    let loading = true;
    let addresses: AddressesList;
    let selectedAddress: string;
    let error: string;
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
        loading = true;
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
        loading = false;
    });

    async function handleSubmit() {
        try {
            if (selectedAddress === $organization.billingAddressId) {
                show = false;
            } else if (selectedAddress === '$new') {
                const address = await sdk.forConsole.billing.createAddress(
                    country,
                    streetAddress,
                    city,
                    state,
                    postalCode ? postalCode : undefined,
                    addressLine2 ? postalCode : undefined
                );
                await sdk.forConsole.billing.setBillingAddress($organization.$id, address.$id);

                invalidate(Dependencies.ORGANIZATION);
                invalidate(Dependencies.ADDRESS);

                trackEvent(Submit.OrganizationBillingAddressUpdate);
                addNotification({
                    type: 'success',
                    message: `Billing address has been created`
                });
                addNotification({
                    type: 'success',
                    message: `Your billing address has been updated`
                });
            } else {
                await sdk.forConsole.billing.setBillingAddress($organization.$id, selectedAddress);

                invalidate(Dependencies.ORGANIZATION);
                invalidate(Dependencies.ADDRESS);

                addNotification({
                    type: 'success',
                    message: `Your billing address has been updated`
                });
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

<Modal bind:show bind:error onSubmit={handleSubmit} title="Replace billing address">
    <p class="text">Replace the existing billing address for your organization.</p>
    {#if loading}
        <Layout.Stack>
            <Skeleton variant="line" width="100%" height={128} />
            <Skeleton variant="line" width="100%" height={45} />
        </Layout.Stack>
    {:else if addresses?.total}
        <Layout.Stack>
            {#each addresses.billingAddresses as address}
                <Card.Selector
                    title={address.streetAddress}
                    name={address.$id}
                    value={address.$id}
                    bind:group={selectedAddress}
                    disabled={$organization.billingAddressId === address.$id}>
                    <div slot="action">
                        {#if $organization.billingAddressId === address.$id}
                            <Badge variant="secondary" size="xs" content="Current" />
                        {/if}
                    </div>
                    {#if address?.addressLine2}
                        <p class="text">{address.addressLine2}</p>
                    {/if}
                    <p class="text">{address.city}</p>
                    <p class="text">{address.state}</p>
                    <p class="text">{address.postalCode}</p>
                    <p class="text">{address.country}</p>
                </Card.Selector>
            {/each}
            <Card.Selector
                title="Add a new billing address"
                name="$new"
                bind:group={selectedAddress}
                value="$new" />
            {#if selectedAddress === '$new'}
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
                <InputText
                    bind:value={state}
                    id="state"
                    label="State"
                    placeholder="Enter your state"
                    required />
                <InputText
                    bind:value={postalCode}
                    id="zip"
                    label="Postal code"
                    placeholder="Enter postal code" />
            {/if}
        </Layout.Stack>
    {:else}
        <Alert.Inline>
            <Button secondary href={`${base}/account/payments`} slot="actions">Add address</Button>
            There are no billing addresses linked to your account.</Alert.Inline>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button
            secondary
            submit
            disabled={loading ||
                selectedAddress === $organization.billingAddressId ||
                !addresses?.total}>
            Save
        </Button>
    </svelte:fragment>
</Modal>
