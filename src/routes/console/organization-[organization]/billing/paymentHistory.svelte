<script lang="ts">
    import { page } from '$app/stores';
    import {
        CardGrid,
        DropList,
        DropListLink,
        EmptySearch,
        Heading,
        PaginationInline
    } from '$lib/components';
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
    import type { InvoiceList } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { VARS } from '$lib/system';
    import { Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';

    let showDropdown = [];

    let offset = 0;
    let invoiceList: InvoiceList = {
        invoices: [],
        total: 0
    };

    const limit = 5;
    const endpoint = VARS.APPWRITE_ENDPOINT ?? `${$page.url.origin}/v1`;

    onMount(async () => {
        request();
    });

    async function request() {
        invoiceList = await sdk.forConsole.billing.listInvoices($page.params.organization, [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
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
        {#if invoiceList.total}
            <Table noMargin noStyles transparent>
                <TableHeader>
                    <TableCellHead>Due Date</TableCellHead>
                    <TableCellHead>Status</TableCellHead>
                    <TableCellHead>Amount Due</TableCellHead>
                    <TableCellHead>Invoice #</TableCellHead>
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    {#each invoiceList?.invoices as invoice, i}
                        {@const status = invoice.status}
                        {#if i !== 0}
                            <TableRow>
                                <TableCellText title="date">
                                    {toLocaleDate(invoice.dueAt)}
                                </TableCellText>
                                <TableCell title="status">
                                    <Pill
                                        danger={status === 'overdue'}
                                        success={status === 'paid'}
                                        warning={status === 'pending'}>
                                        {status}
                                    </Pill>
                                </TableCell>
                                <TableCellText title="due">{invoice.amount}</TableCellText>
                                <TableCellText title="invoice number">
                                    {invoice.$id}
                                </TableCellText>
                                <TableCell showOverflow>
                                    <DropList
                                        bind:show={showDropdown[i]}
                                        placement="bottom-start"
                                        noArrow>
                                        <Button
                                            round
                                            text
                                            noMargin
                                            ariaLabel="More options"
                                            on:click={() => {
                                                showDropdown[i] = !showDropdown[i];
                                            }}>
                                            <span class="icon-dots-horizontal" aria-hidden="true" />
                                        </Button>
                                        <svelte:fragment slot="list">
                                            <DropListLink
                                                icon="external-link"
                                                external
                                                href={`${endpoint}/organizations/${$page.params.organization}/invoices/${invoice.$id}/view`}
                                                on:click={() =>
                                                    (showDropdown[i] = !showDropdown[i])}
                                                event="view_invoice">
                                                View invoice
                                            </DropListLink>
                                            <DropListLink
                                                icon="download"
                                                href={`${endpoint}/organizations/${$page.params.organization}/invoices/${invoice.$id}/download`}
                                                on:click={() => {
                                                    showDropdown[i] = !showDropdown[i];
                                                }}
                                                event="download_invoice">
                                                Download PDF
                                            </DropListLink>
                                        </svelte:fragment>
                                    </DropList>
                                </TableCell>
                            </TableRow>
                        {/if}
                    {/each}
                </TableBody>
            </Table>
            <div class="u-flex u-main-space-between">
                <p class="text">Total results: {invoiceList?.total}</p>
                <PaginationInline {limit} bind:offset sum={invoiceList?.total} hidePages />
            </div>
        {:else}
            <EmptySearch hidePagination>
                <p class="text u-text-center">
                    You have no payment history. After you receive your first invoice, you'll see it
                    here.
                </p>
            </EmptySearch>
        {/if}
    </svelte:fragment>
</CardGrid>
