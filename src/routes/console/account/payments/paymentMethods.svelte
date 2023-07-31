<script lang="ts">
    import {
        CardGrid,
        CreditCardInfo,
        DropList,
        DropListItem,
        Empty,
        Heading
    } from '$lib/components';
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
    import { tooltip } from '$lib/actions/tooltip';
    import { base } from '$app/paths';
    import EditPaymentModal from './editPaymentModal.svelte';
    import DeletePaymentModal from './deletePaymentModal.svelte';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import PaymentModal from './paymentModal.svelte';

    export let showPayment = false;
    let showDropdown = [];
    let selectedMethod: string;
    let selectedLinkedOrgs: Organization[] = [];
    let showDelete = false;
    let showEdit = false;

    $: orgList = $organizationList.teams as unknown as Organization[];

    $: filteredMethods = $paymentMethods?.paymentMethods.filter(
        (method: PaymentMethodData) => !!method?.last4
    );
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment Methods</Heading>

    <p class="text">
        View or update your payment methods. These can be applied to any organizations you have
        created.
    </p>
    <svelte:fragment slot="aside">
        {#if $paymentMethods?.total}
            <Table noMargin noStyles>
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
                                            <div
                                                use:tooltip={{
                                                    interactive: true,
                                                    allowHTML: true,
                                                    trigger: 'click',
                                                    content: `
                                                        <div class="u-flex u-flex-vertical u-gap-8">
                                                            <p class="text">This payment method is linked to the following organizations:</p>                                                         
                                                            ${linkedOrgs
                                                                .map(
                                                                    (org) =>
                                                                        `<a href="${base}/console/organization-${org.$id}/billing" class="link">${org.name}</a>`
                                                                )
                                                                .join('')}
                                                        </div>`
                                                }}>
                                                <Pill button>
                                                    <span class="icon-info" /> linked to organization
                                                </Pill>
                                            </div>
                                        {/if}
                                        <DropList
                                            bind:show={showDropdown[i]}
                                            placement="bottom-start"
                                            noArrow>
                                            <Button
                                                round
                                                text
                                                on:click={() => {
                                                    showDropdown[i] = !showDropdown[i];
                                                }}>
                                                <span class="icon-dots-horizontal" />
                                            </Button>
                                            <svelte:fragment slot="list">
                                                <DropListItem
                                                    icon="pencil"
                                                    on:click={() => {
                                                        showEdit = true;
                                                        showDropdown[i] = false;
                                                        selectedMethod = paymentMethod.$id;
                                                    }}>
                                                    Edit
                                                </DropListItem>
                                                <DropListItem
                                                    icon="trash"
                                                    on:click={() => {
                                                        selectedMethod = paymentMethod.$id;
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
            <Button text noMargin on:click={() => (showPayment = true)}>
                <span class="icon-plus" />
                <span class="text">Add a payment method</span>
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
    <EditPaymentModal selectedPaymentMethod={selectedMethod} bind:show={showEdit} />
{/if}

{#if selectedMethod}
    <DeletePaymentModal method={selectedMethod} bind:showDelete linkedOrgs={selectedLinkedOrgs} />
{/if}
