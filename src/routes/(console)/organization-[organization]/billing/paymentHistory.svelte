<script lang="ts">
    import { page } from '$app/stores';
    import {
        CardGrid,
        DropList,
        DropListItem,
        DropListLink,
        EmptySearch,
        Heading,
        PaginationInline
    } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Invoice, InvoiceList } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { selectedInvoice, showRetryModal } from './store';
    import { base } from '$app/paths';

    let showDropdown = [];
    let showFailedError = false;

    let offset = 0;
    let invoiceList: InvoiceList = {
        invoices: [],
        total: 0
    };

    const limit = 5;

    onMount(request);

    async function request() {
        invoiceList = await sdk.forConsole.billing.listInvoices($page.params.organization, [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ]);
    }

    $: if ($page.url.searchParams.get('type') === 'validate-invoice') {
        window.history.replaceState({}, '', $page.url.pathname);
        request();
    }

    function retryPayment(invoice: Invoice) {
        $selectedInvoice = invoice;
        $showRetryModal = true;
    }

    $: if (offset !== null) {
        request();
    }
</script>

<CardGrid>
    <Heading id="payment-history" tag="h2" size="6">Payment history</Heading>

    <p class="text">
        Transaction history for this organization. Download invoices for more details about your
        payments.
    </p>
    <svelte:fragment slot="aside">
        {#if invoiceList.total > 0}
            <TableScroll noMargin transparent noStyles>
                <TableHeader>
                    <TableCellHead width={100}>Due Date</TableCellHead>
                    <TableCellHead width={110}>Status</TableCellHead>
                    <TableCellHead width={100}>Amount Due</TableCellHead>
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    {#each invoiceList?.invoices as invoice, i}
                        {@const status = invoice.status}
                        <TableRow>
                            <TableCellText title="date">
                                {toLocaleDate(invoice.dueAt)}
                            </TableCellText>
                            <TableCell title="status">
                                {#if invoice?.lastError}
                                    <DropList bind:show={showFailedError}>
                                        <Pill
                                            danger={status === 'overdue' ||
                                                status === 'failed' ||
                                                status === 'requires_authentication'}
                                            success={status === 'paid' || status === 'succeeded'}
                                            warning={status === 'pending'}
                                            on:click={() => (showFailedError = true)}
                                            button>
                                            {status === 'requires_authentication'
                                                ? 'failed'
                                                : status}
                                        </Pill>
                                        <svelte:fragment slot="list">
                                            <li>
                                                The scheduled payment has failed.
                                                <Button
                                                    link
                                                    on:click={() => {
                                                        retryPayment(invoice);
                                                        showFailedError = false;
                                                    }}
                                                    >Try again
                                                </Button>
                                                .
                                            </li>
                                        </svelte:fragment>
                                    </DropList>
                                {:else}
                                    <Pill
                                        danger={status === 'overdue' ||
                                            status === 'failed' ||
                                            status === 'requires_authentication'}
                                        success={status === 'paid' || status === 'succeeded'}
                                        warning={status === 'pending'}>
                                        {status === 'requires_authentication' ? 'failed' : status}
                                    </Pill>
                                {/if}
                            </TableCell>
                            <TableCellText title="due">
                                {formatCurrency(invoice.grossAmount)}
                            </TableCellText>
                            <TableCell showOverflow right>
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
                                            href={`${base}/organization-${$page.params.organization}/invoices/${invoice.$id}/view`}
                                            on:click={() => (showDropdown[i] = !showDropdown[i])}
                                            event="view_invoice">
                                            View invoice
                                        </DropListLink>
                                        <DropListLink
                                            icon="download"
                                            href={`${base}/organization-${$page.params.organization}/invoices/${invoice.$id}/download`}
                                            on:click={() => {
                                                showDropdown[i] = !showDropdown[i];
                                            }}
                                            event="download_invoice">
                                            Download PDF
                                        </DropListLink>
                                        {#if status === 'overdue' || status === 'failed'}
                                            <DropListItem
                                                icon="refresh"
                                                on:click={() => {
                                                    retryPayment(invoice);
                                                    showDropdown[i] = !showDropdown[i];
                                                    trackEvent(`click_retry_payment`, {
                                                        from: 'button',
                                                        source: 'billing_invoice_menu'
                                                    });
                                                }}>
                                                Retry payment
                                            </DropListItem>
                                        {/if}
                                    </svelte:fragment>
                                </DropList>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </TableScroll>
            <div class="u-flex u-main-space-between">
                <p class="text">Total results: {invoiceList.total}</p>
                <PaginationInline {limit} bind:offset sum={invoiceList.total} hidePages />
            </div>
            <!--{:else if isLoadingInvoices}-->
            <!--    <div class="loader-holder">-->
            <!--        <div class="loader" />-->
            <!--    </div>-->
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

<!--<style>-->
<!--    .loader-holder {-->
<!--        height: 100%;-->
<!--        align-content: center;-->
<!--        justify-items: center;-->
<!--    }-->
<!--</style>-->
