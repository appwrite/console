<script lang="ts">
    import { page } from '$app/stores';
    import { CardGrid, DropList, EmptySearch, Heading, PaginationInline } from '$lib/components';
    import DropListItem from '$lib/components/dropListItem.svelte';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { Query } from '@appwrite.io/console';
    import { invoiceList } from './store';

    let showDropdown = [];
    let selectedInvoice: string;
    let offset = 0;

    async function download() {
        sdk.forConsole.billing.downloadInvoice($page.params.organization, selectedInvoice);
    }

    async function view() {
        sdk.forConsole.billing.getInvoiceView($page.params.organization, selectedInvoice);
    }

    async function request() {
        $invoiceList = await sdk.forConsole.billing.listInvoices($page.params.organization, [
            Query.limit(5),
            Query.offset(offset)
        ]);
    }

    $: if (offset !== null) {
        request();
    }
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment history</Heading>

    <p class="text">
        Transaction history for this Organization. Download invoices for more details about your
        payments.
    </p>
    <svelte:fragment slot="aside">
        {#if $invoiceList.total}
            <Table noMargin noStyles>
                <TableHeader>
                    <TableCellHead>Date</TableCellHead>
                    <TableCellHead>Status</TableCellHead>
                    <TableCellHead>Amount Due</TableCellHead>
                    <TableCellHead>Invoce #</TableCellHead>
                    <TableCellHead width={20} />
                </TableHeader>
                <TableBody>
                    {#each $invoiceList?.invoices as invoice, i}
                        <TableRow>
                            <TableCellText title="date">{toLocaleDate(invoice.from)}</TableCellText>
                            <TableCell title="status">
                                <Pill>test</Pill>
                            </TableCell>
                            <TableCellText title="due">{invoice.amount}</TableCellText>
                            <TableCellText title="invoice number"
                                >{invoice.aggregationId}
                            </TableCellText>
                            <TableCell showOverflow>
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
                                            icon="external-link"
                                            on:click={() => {
                                                selectedInvoice = invoice.$id;
                                                view();
                                            }}>
                                            View invoice
                                        </DropListItem>
                                        <DropListItem
                                            icon="download"
                                            on:click={() => {
                                                selectedInvoice = invoice.$id;
                                                download();
                                            }}>Download PDF</DropListItem>
                                    </svelte:fragment>
                                </DropList>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
            <div class="u-flex u-margin-block-start-32 u-main-space-between">
                <p class="text">Total results: {$invoiceList?.total}</p>
                <PaginationInline limit={5} bind:offset sum={$invoiceList?.total} hidePages />
            </div>
        {:else}
            <EmptySearch cardOnly>
                <p class="text u-text-center">
                    You have no payment history. After you receive your first invoice, you'll see it
                    here.
                </p>
            </EmptySearch>
        {/if}
    </svelte:fragment>
</CardGrid>
