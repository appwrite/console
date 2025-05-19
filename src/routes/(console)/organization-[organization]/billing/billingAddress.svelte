<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import type { Address } from '$lib/sdk/billing';
    import { addressList } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import RemoveAddress from './removeAddress.svelte';
    import { user } from '$lib/stores/user';
    import AddressModal from '$routes/(console)/account/payments/addressModal.svelte';
    import EditAddressModal from '$routes/(console)/account/payments/editAddressModal.svelte';
    import ReplaceAddress from './replaceAddress.svelte';
    import { ActionMenu, Card, Divider, Icon, Layout, Popover } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconPencil,
        IconPlus,
        IconSwitchHorizontal,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';

    export let billingAddress: Address = null;

    let showCreate = false;
    let showEdit = false;
    let showReplace = false;
    let showRemove = false;

    async function addAddress(addressId: string) {
        try {
            await sdk.forConsole.organizations.setBillingAddress($organization.$id, addressId);

            await invalidate(Dependencies.ADDRESS);
            await invalidate(Dependencies.ORGANIZATION);

            addNotification({
                type: 'success',
                message: `A new billing address has been added to ${$organization.name}`
            });
            trackEvent(Submit.OrganizationBillingAddressUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationBillingAddressUpdate);
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Billing address</svelte:fragment>
    View or update your billing address. This address will be included in your invoices from Appwrite.
    <svelte:fragment slot="aside">
        {#if $organization?.billingAddressId && billingAddress}
            <Card.Base variant="secondary" padding="s">
                <Layout.Stack direction="row" justifyContent="space-between">
                    <div>
                        <p class="text">{billingAddress.streetAddress}</p>
                        {#if billingAddress?.addressLine2}
                            <p class="text">{billingAddress.addressLine2}</p>
                        {/if}
                        <p class="text">{billingAddress.city}</p>
                        <p class="text">{billingAddress.state}</p>
                        <p class="text">{billingAddress.postalCode}</p>
                        <p class="text">{billingAddress.country}</p>
                    </div>
                    <div>
                        <Popover let:toggle placement="bottom-end" padding="none">
                            <Button text icon ariaLabel="more options" on:click={toggle}>
                                <Icon icon={IconDotsHorizontal} size="s" />
                            </Button>
                            <ActionMenu.Root slot="tooltip">
                                {#if billingAddress.userId === $user.$id}
                                    <ActionMenu.Item.Button
                                        on:click={() => (showEdit = true)}
                                        leadingIcon={IconPencil}>
                                        Edit
                                    </ActionMenu.Item.Button>
                                {/if}
                                <ActionMenu.Item.Button
                                    on:click={() => (showReplace = true)}
                                    leadingIcon={IconSwitchHorizontal}>
                                    Replace
                                </ActionMenu.Item.Button>
                                <ActionMenu.Item.Button
                                    on:click={() => (showRemove = true)}
                                    leadingIcon={IconTrash}>
                                    Remove
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </Popover>
                    </div>
                </Layout.Stack>
            </Card.Base>
        {:else}
            <Card.Base>
                <Layout.Stack justifyContent="center" alignItems="center" gap="m">
                    <Popover let:toggle padding="none" placement="bottom-start">
                        <Button secondary icon on:click={toggle}>
                            <Icon icon={IconPlus} size="s" />
                        </Button>
                        <ActionMenu.Root slot="tooltip">
                            {#each $addressList.billingAddresses as address}
                                <ActionMenu.Item.Button on:click={() => addAddress(address?.$id)}>
                                    <span>{address.streetAddress}</span>,
                                    {#if address?.addressLine2}
                                        <span>{address.addressLine2}</span>,
                                    {/if}
                                    <span>{address.city}</span>,
                                    <span>{address.state}</span>,
                                    <span>{address.postalCode}</span>,
                                    <span>{address.country}</span>
                                </ActionMenu.Item.Button>
                            {/each}
                            <Divider />
                            <ActionMenu.Item.Button
                                leadingIcon={IconPlus}
                                on:click={() => (showCreate = true)}>
                                Add new billing address
                            </ActionMenu.Item.Button>
                        </ActionMenu.Root>
                    </Popover>
                    <span>Add a billing address</span>
                </Layout.Stack>
            </Card.Base>
        {/if}
    </svelte:fragment>
</CardGrid>

{#if showCreate}
    <AddressModal bind:show={showCreate} organization={$organization?.$id} />
{/if}
{#if showEdit}
    <EditAddressModal bind:show={showEdit} bind:selectedAddress={billingAddress} />
{/if}
{#if showReplace}
    <ReplaceAddress bind:show={showReplace} />
{/if}
{#if showRemove}
    <RemoveAddress bind:show={showRemove} />
{/if}
