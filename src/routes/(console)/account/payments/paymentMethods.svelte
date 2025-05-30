<script lang="ts">
    import { CardGrid, CreditCardInfo, Empty } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { paymentMethods } from '$lib/stores/billing';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { base } from '$app/paths';
    import EditPaymentModal from './editPaymentModal.svelte';
    import DeletePaymentModal from './deletePaymentModal.svelte';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import PaymentModal from '$lib/components/billing/paymentModal.svelte';
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

    export let showPayment = false;
    let showDropdown = [];
    let selectedMethod: PaymentMethodData;
    let selectedLinkedOrgs: Organization[] = [];
    let showDelete = false;
    let showEdit = false;
    let isLinked = false;

    $: orgList = $organizationList.teams as unknown as Organization[];

    $: filteredMethods = $paymentMethods?.paymentMethods.filter(
        (method: PaymentMethodData) => !!method?.last4
    );


    const isMethodLinkedToOrg = (methodId: string, org: Organization) => 
        methodId === org.paymentMethodId || methodId === org.backupPaymentMethodId;


    $: linkedMethodIds = new Set(
        orgList.flatMap(org => [org.paymentMethodId, org.backupPaymentMethodId].filter(Boolean))
    );
    $: hasLinkedOrgs = filteredMethods.some(method => linkedMethodIds.has(method.$id));
    $: hasPaymentError = filteredMethods.some((method) => method?.lastError || method?.expired);
</script>

<CardGrid>
    <svelte:fragment slot="title">Payment methods</svelte:fragment>
    View or update your payment methods. These can be applied to any organizations you have created.
    <svelte:fragment slot="aside">
        {#if $paymentMethods?.total && filteredMethods?.length > 0}
            <Table.Root
                let:root
                columns={[
                    { id: 'cc', width: 140 },
                    { id: 'name', width: { min: 140 } },
                    { id: 'expiry', width: 100 },
                    { id: 'status', width: 110, hide: !hasPaymentError },
                    { id: 'links', width: 190, hide: !hasLinkedOrgs },
                    { id: 'actions', width: 40 }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="cc" {root}>Credit card</Table.Header.Cell>
                    <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
                    <Table.Header.Cell column="expiration" {root}>
                        Expiration date
                    </Table.Header.Cell>
                    <Table.Header.Cell column="status" {root} />
                    <Table.Header.Cell column="links" {root} />
                    <Table.Header.Cell column="actions" {root} />
                </svelte:fragment>
                {#each filteredMethods as paymentMethod, i}
                    {@const linkedOrgs = orgList?.filter(org => 
                        isMethodLinkedToOrg(paymentMethod.$id, org)
                    )}

                    <Table.Row.Base {root}>
                        <CreditCardInfo {root} {paymentMethod} />
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
                                                This payment method is linked to the following
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
                            <Popover let:toggle placement="bottom-start" padding="none">
                                <Button icon text on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <svelte:fragment slot="tooltip">
                                    <ActionMenu.Root>
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconPencil}
                                            on:click={() => {
                                                showEdit = true;
                                                showDropdown[i] = false;
                                                selectedMethod = paymentMethod;
                                                isLinked = !!linkedOrgs?.length;
                                            }}>
                                            Edit
                                        </ActionMenu.Item.Button>
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconTrash}
                                            on:click={() => {
                                                selectedMethod = paymentMethod;
                                                selectedLinkedOrgs = linkedOrgs;
                                                showDelete = true;
                                                showDropdown[i] = false;
                                            }}>
                                            Delete
                                        </ActionMenu.Item.Button>
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Popover>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
            <div>
                <Button secondary on:click={() => (showPayment = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add a payment method
                </Button>
            </div>
        {:else}
            <Empty on:click={() => (showPayment = true)}>
                <p class="text">Add a payment method</p>
            </Empty>
        {/if}
    </svelte:fragment>
</CardGrid>

{#if showPayment && isCloud && hasStripePublicKey}
    <PaymentModal bind:show={showPayment} />
{/if}
{#if showEdit && isCloud && hasStripePublicKey}
    <EditPaymentModal selectedPaymentMethod={selectedMethod} bind:show={showEdit} {isLinked} />
{/if}

{#if selectedMethod}
    <DeletePaymentModal
        method={selectedMethod.$id}
        bind:showDelete
        linkedOrgs={selectedLinkedOrgs} />
{/if}
