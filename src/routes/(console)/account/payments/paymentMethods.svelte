<script lang="ts">
    import { CardGrid, CreditCardInfo, DropList, DropListItem, Empty } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { paymentMethods } from '$lib/stores/billing';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { base } from '$app/paths';
    import EditPaymentModal from './editPaymentModal.svelte';
    import DeletePaymentModal from './deletePaymentModal.svelte';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import PaymentModal from '$lib/components/billing/paymentModal.svelte';
    import { IconDotsHorizontal, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Icon } from '@appwrite.io/pink-svelte';

    export let showPayment = false;
    let showDropdown = [];
    let selectedMethod: PaymentMethodData;
    let selectedLinkedOrgs: Organization[] = [];
    let showDelete = false;
    let showEdit = false;
    let isLinked = false;
    let showLinked = [];

    $: orgList = $organizationList.teams as unknown as Organization[];

    $: filteredMethods = $paymentMethods?.paymentMethods.filter(
        (method: PaymentMethodData) => !!method?.last4
    );
</script>

<CardGrid>
    <svelte:fragment slot="title">Payment Methods</svelte:fragment>
    View or update your payment methods. These can be applied to any organizations you have created.
    <svelte:fragment slot="aside">
        {#if $paymentMethods?.total && filteredMethods?.length > 0}
            <Table noMargin noStyles transparent>
                <TableHeader>
                    <TableCellHead>Payment methods</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each filteredMethods as paymentMethod, i}
                        {@const linkedOrgs = orgList?.filter(
                            (org) =>
                                paymentMethod.$id === org.paymentMethodId ||
                                paymentMethod.$id === org.backupPaymentMethodId
                        )}

                        <TableRow>
                            <TableCell>
                                <CreditCardInfo {paymentMethod}>
                                    <div class="u-flex u-gap-16 u-cross-center">
                                        {#if linkedOrgs?.length > 0}
                                            <DropList
                                                bind:show={showLinked[i]}
                                                width="20"
                                                scrollable>
                                                <Pill
                                                    button
                                                    on:click={() =>
                                                        (showLinked[i] = !showLinked[i])}>
                                                    <span class="icon-info" /> linked to organization
                                                </Pill>
                                                <svelte:fragment slot="list">
                                                    <p class="u-break-word">
                                                        This payment method is linked to the
                                                        following organizations:
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

                                        <DropList
                                            bind:show={showDropdown[i]}
                                            placement="bottom-start"
                                            noArrow>
                                            <Button
                                                icon
                                                text
                                                on:click={() => {
                                                    showDropdown[i] = !showDropdown[i];
                                                }}>
                                                <Icon icon={IconDotsHorizontal} size="s" />
                                            </Button>
                                            <svelte:fragment slot="list">
                                                <DropListItem
                                                    icon="pencil"
                                                    on:click={() => {
                                                        showEdit = true;
                                                        showDropdown[i] = false;
                                                        selectedMethod = paymentMethod;
                                                        isLinked = !!linkedOrgs?.length;
                                                    }}>
                                                    Edit
                                                </DropListItem>
                                                <DropListItem
                                                    icon="trash"
                                                    on:click={() => {
                                                        selectedMethod = paymentMethod;
                                                        selectedLinkedOrgs = linkedOrgs;
                                                        showDelete = true;
                                                        showDropdown[i] = false;
                                                    }}>
                                                    Delete
                                                </DropListItem>
                                            </svelte:fragment>
                                        </DropList>
                                    </div>
                                </CreditCardInfo>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
            <Button text on:click={() => (showPayment = true)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add a payment method
            </Button>
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
