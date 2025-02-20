<script lang="ts">
    import { CardGrid, DropList, DropListItem, Empty, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { addressList } from '$lib/stores/billing';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import AddressModal from './addressModal.svelte';
    import type { Models } from '@appwrite.io/console';
    import DeleteAddress from './deleteAddressModal.svelte';
    import EditAddressModal from './editAddressModal.svelte';
    import type { Address } from '$lib/sdk/billing';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { base } from '$app/paths';
    import { Pill } from '$lib/elements';
    import { page } from '$app/stores';

    let show = false;
    let showEdit = false;
    let selectedAddress: Address;
    let selectedLinkedOrgs: Organization[] = [];
    let showDelete = false;
    let showDropdown = [];
    let countryList: Models.CountryList;
    let showLinked = [];

    onMount(async () => {
        countryList = await sdk
            .forProject($page.params.region, $page.params.project)
            .locale.listCountries();
    });

    $: orgList = $organizationList.teams as unknown as Organization[];
</script>

<CardGrid>
    <Heading tag="h2" size="6">Billing Address</Heading>

    <p class="text">
        View or update your billing address. This address will be included in your invoices from
        Appwrite.
    </p>
    <svelte:fragment slot="aside">
        {#if $addressList.total && countryList?.total}
            <Table noMargin noStyles transparent>
                <TableHeader>
                    <TableCellHead>Billing address</TableCellHead>
                    <TableCellHead width={195} />
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    {#each $addressList.billingAddresses as address, i}
                        {@const country = countryList?.countries?.find(
                            (c) => c.code === address.country
                        )}
                        {@const linkedOrgs = orgList?.filter(
                            (org) => address.$id === org.billingAddressId
                        )}

                        <TableRow>
                            <TableCell>
                                <div class="u-line-height-1-5">
                                    <p class="text">{address.streetAddress}</p>
                                    {#if address?.addressLine2}
                                        <p class="text">{address.addressLine2}</p>
                                    {/if}
                                    <p class="text">{address.city}</p>
                                    <p class="text">{address.state}</p>
                                    <p class="text">{address.postalCode}</p>
                                    <p class="text">{country ? country.name : address.country}</p>
                                </div>
                            </TableCell>
                            <TableCell style="vertical-align: top;">
                                {#if linkedOrgs?.length > 0}
                                    <DropList bind:show={showLinked[i]} width="20" scrollable>
                                        <Pill
                                            button
                                            on:click={() => (showLinked[i] = !showLinked[i])}>
                                            <span class="icon-info" /> linked to organization
                                        </Pill>
                                        <svelte:fragment slot="list">
                                            <p class="u-break-word">
                                                This billing address is linked to the following
                                                organizations:
                                            </p>
                                            <div class="u-flex u-flex-vertical u-gap-4">
                                                {#each linkedOrgs as org}
                                                    <a
                                                        class="u-underline u-trim"
                                                        href={`${base}/organization-${org.$id}/billing`}>
                                                        {org.name}
                                                    </a>
                                                {/each}
                                            </div>
                                        </svelte:fragment>
                                    </DropList>
                                {/if}
                            </TableCell>
                            <TableCell style="vertical-align: top;">
                                <DropList
                                    bind:show={showDropdown[i]}
                                    placement="bottom-start"
                                    noArrow>
                                    <Button
                                        round
                                        text
                                        ariaLabel="More options"
                                        on:click={() => {
                                            showDropdown[i] = !showDropdown[i];
                                        }}>
                                        <span class="icon-dots-horizontal" aria-hidden="true" />
                                    </Button>
                                    <svelte:fragment slot="list">
                                        <DropListItem
                                            icon="pencil"
                                            on:click={() => {
                                                showEdit = true;
                                                selectedAddress = address;
                                                showDropdown[i] = false;
                                            }}>
                                            Edit
                                        </DropListItem>
                                        <DropListItem
                                            icon="trash"
                                            on:click={() => {
                                                showDelete = true;
                                                selectedAddress = address;
                                                selectedLinkedOrgs = linkedOrgs;
                                                showDropdown[i] = false;
                                            }}>
                                            Delete
                                        </DropListItem>
                                    </svelte:fragment>
                                </DropList>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>

            <Button text noMargin on:click={() => (show = true)}>
                <span class="icon-plus" />
                <span class="text">Add a billing address</span>
            </Button>
        {:else}
            <Empty on:click={() => (show = true)}>
                <p class="text">Add a billing address</p>
            </Empty>
        {/if}
    </svelte:fragment>
</CardGrid>

<AddressModal bind:show />
<EditAddressModal bind:show={showEdit} {selectedAddress} />
<DeleteAddress bind:showDelete {selectedAddress} linkedOrgs={selectedLinkedOrgs} />
