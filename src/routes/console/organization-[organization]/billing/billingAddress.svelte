<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, DropList, Heading } from '$lib/components';
    import DropListItem from '$lib/components/dropListItem.svelte';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addressList } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import AddressModal from '$routes/console/account/payments/addressModal.svelte';

    let showDropdown = false;
    let showCreate = false;

    async function addAddress(addressId: string) {
        try {
            await sdk.forConsole.billing.setBillingAddress($organization.$id, addressId);
            await invalidate(Dependencies.ADDRESS);
            showDropdown = false;
            addNotification({
                type: 'success',
                message: `A new billing address has been added to ${$organization.name}`
            });
            trackEvent(Submit.OrganizationBillingAddressSet);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationBillingAddressSet);
        }
    }

    $: billingAddress = $addressList?.billingAddresses?.find(
        (address) => address.$id === $organization?.billingAddress
    );
</script>

<CardGrid>
    <Heading tag="h2" size="6">Billing address</Heading>

    <p class="text">
        View or update your billing address. This address will appear on your invoice.
    </p>
    <svelte:fragment slot="aside">
        {#if $organization?.billingAddress && billingAddress}
            <div class="box">
                <div class="u-flex u-main-space-between u-cross-start">
                    <div class="u-line-height-1-5 u-flex u-flex-vertical u-gap-2">
                        <p class="text">{billingAddress.streetAddress}</p>
                        <p class="text">{billingAddress.city}</p>
                        <p class="text">{billingAddress.state}</p>
                        <p class="text">{billingAddress.postalCode}</p>
                        <p class="text">{billingAddress.country}</p>
                    </div>
                </div>
            </div>
        {:else}
            <article class="card u-grid u-cross-center u-width-full-line dashed">
                <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                    <div class="common-section">
                        <DropList bind:show={showDropdown} placement="bottom-start">
                            <Button secondary round on:click={() => (showDropdown = !showDropdown)}>
                                <i class="icon-plus" />
                            </Button>
                            <svelte:fragment slot="list">
                                {#if $addressList?.total}
                                    {#each $addressList.billingAddresses as address}
                                        <DropListItem on:click={() => addAddress(address?.$id)}>
                                            <p class="text">
                                                <span>{address.streetAddress}</span>,
                                                <span>{address.city}</span>,
                                                <span>{address.state}</span>,
                                                <span>{address.postalCode}</span>,
                                                <span>{address.country}</span>
                                            </p>
                                        </DropListItem>
                                    {/each}
                                {/if}
                                <DropListItem
                                    on:click={() => {
                                        showCreate = true;
                                        showDropdown = false;
                                    }}>Add new billing address</DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </div>
                    <div class="common-section">
                        <span class="text"> Add a billing address</span>
                    </div>
                </div>
            </article>
        {/if}
    </svelte:fragment>
</CardGrid>

<AddressModal bind:show={showCreate} organization={$organization.$id} />
