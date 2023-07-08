<script lang="ts">
    import { CardGrid, DropList, DropListItem, Empty, Heading } from '$lib/components';
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
                    <TableCellHead width={220} />
                    <TableCellHead width={50} />
                </TableHeader>
                <TableBody>
                    {#each $paymentMethods.paymentMethods as paymentMethod, i}
                        <TableRow>
                            <TableCell>
                                <p class="text u-bold">
                                    {paymentMethod.brand} ending in {paymentMethod.last4}
                                    <span>{paymentMethod.brand}</span>
                                </p>
                                <p class="text">
                                    Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                                </p>
                            </TableCell>
                            <TableCell>
                                {#if paymentMethod.default}
                                    <Pill>
                                        <span class="icon-info" /> default payment method
                                    </Pill>
                                {/if}
                                {#if paymentMethod.backup}
                                    <Pill>
                                        <span class="icon-info" /> backup payment method
                                    </Pill>
                                {/if}
                            </TableCell>
                            <TableCell showOverflow>
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
