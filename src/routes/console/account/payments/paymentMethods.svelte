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
    import DeletePayment from './deletePayment.svelte';
    import { paymentMethods } from './store';

    export let showPayment = false;
    let showDropdown = [];
    let selectedMethod: string;
    let showDelete = false;

    console.log($paymentMethods);

    $: filteredMethods = $paymentMethods?.paymentMethods.filter((method) => !!method?.last4);
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment Methods</Heading>

    <p class="text">
        View or update your payment methods. These can be applied to any organizations you have
        created.
    </p>
    <svelte:fragment slot="aside">
        {#if $paymentMethods.total > 0}
            <Table noMargin noStyles>
                <TableHeader>
                    <TableCellHead>Payment methods</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each filteredMethods as paymentMethod, i}
                        <TableRow>
                            <TableCell>
                                <CreditCardInfo {paymentMethod}>
                                    <div class="u-flex u-gap-16">
                                        <Pill>test</Pill>
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
                                                        console.log('test');
                                                    }}>
                                                    Edit
                                                </DropListItem>
                                                <DropListItem
                                                    icon="trash"
                                                    on:click={() => {
                                                        selectedMethod = paymentMethod.$id;
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

{#if selectedMethod}
    <DeletePayment method={selectedMethod} bind:showDelete />
{/if}
