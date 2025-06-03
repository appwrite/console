<script lang="ts">
    import { CardGrid, Empty } from '$lib/components';
    import { Button } from '$lib/elements/forms';
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
    import {
        IconDotsHorizontal,
        IconInfo,
        IconPencil,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Icon,
        Layout,
        Link,
        Popover,
        Table,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';

    let show = false;
    let showEdit = false;
    let selectedAddress: Address;
    let selectedLinkedOrgs: Organization[] = [];
    let showDelete = false;
    let countryList: Models.CountryList;

    onMount(async () => {
        countryList = await sdk.forConsole.locale.listCountries();
    });

    $: orgList = $organizationList.teams as unknown as Organization[];
</script>

<CardGrid>
    <svelte:fragment slot="title">Billing address</svelte:fragment>
    View or update your billing address. This address will be included in your invoices from Appwrite.
    <svelte:fragment slot="aside">
        {#if $addressList.total && countryList?.total}
            <Table.Root
                let:root
                columns={[{ id: 'address' }, { id: 'links' }, { id: 'actions', width: 40 }]}>
                {#each $addressList.billingAddresses as address}
                    {@const country = countryList?.countries?.find(
                        (c) => c.code === address.country
                    )}
                    {@const linkedOrgs = orgList?.filter(
                        (org) => address.$id === org.billingAddressId
                    )}

                    <Table.Row.Base {root}>
                        <Table.Cell column="address" {root}>
                            {address.streetAddress},
                            {#if address?.addressLine2}
                                {address.addressLine2},
                            {/if}
                            {address.city},
                            {#if address?.state}
                                {address.state},
                            {/if}
                            {#if address?.postalCode}
                                {address.postalCode},
                            {/if}
                            {country ? country.name : address.country}
                        </Table.Cell>
                        <Table.Cell column="links" {root}>
                            {#if linkedOrgs?.length > 0}
                                <Popover let:toggle>
                                    <Tag on:click={toggle} size="s">
                                        <Icon icon={IconInfo} slot="start" />
                                        linked to organization
                                    </Tag>
                                    <svelte:fragment slot="tooltip">
                                        <Layout.Stack>
                                            <Typography.Text>
                                                This billing address is linked to the following
                                                organizations:
                                            </Typography.Text>
                                            <Layout.Stack gap="xxs">
                                                {#each linkedOrgs as org}
                                                    <Link.Anchor
                                                        href={`${base}/organization-${org.$id}/billing`}>
                                                        {org.name}
                                                    </Link.Anchor>
                                                {/each}
                                            </Layout.Stack>
                                        </Layout.Stack>
                                    </svelte:fragment>
                                </Popover>
                            {/if}
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <Popover let:toggle placement="bottom-end" padding="none">
                                <Button icon text ariaLabel="More options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip">
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconPencil}
                                        on:click={() => {
                                            showEdit = true;
                                            selectedAddress = address;
                                        }}>
                                        Edit
                                    </ActionMenu.Item.Button>
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconTrash}
                                        on:click={() => {
                                            showDelete = true;
                                            selectedAddress = address;
                                            selectedLinkedOrgs = linkedOrgs;
                                        }}>
                                        Delete
                                    </ActionMenu.Item.Button>
                                </ActionMenu.Root>
                            </Popover>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>

            <div>
                <Button secondary on:click={() => (show = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add a billing address
                </Button>
            </div>
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
