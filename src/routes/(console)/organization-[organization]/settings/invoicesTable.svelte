<script lang="ts">
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { Pill } from '$lib/elements';
    import { DropList, DropListItem, DropListLink } from '$lib/components';
    import type { Invoice } from '$lib/sdk/billing';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import { selectedInvoice, showRetryModal } from '../billing/store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Button } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    let showDropdown = [];
    let showFailedError = false;
    const endpoint = getApiEndpoint();

    export let invoices: Invoice[];
    export let showActions = true;

    function retryPayment(invoice: Invoice) {
        $selectedInvoice = invoice;
        $showRetryModal = true;
    }
</script>

<TableScroll noMargin transparent noStyles>
    <TableHeader>
        <TableCellHead width={100}>Due Date</TableCellHead>
        <TableCellHead width={80}>Status</TableCellHead>
        <TableCellHead width={100}>Amount Due</TableCellHead>
        {#if showActions}
            <TableCellHead width={40} />
        {/if}
    </TableHeader>
    <TableBody>
        {#each invoices as invoice, i}
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
                                button>
                                {status === 'requires_authentication' ? 'failed' : status}
                            </Pill>
                            <svelte:fragment slot="list">
                                <li>
                                    The scheduled payment has failed.
                                    <Button
                                        link
                                        on:click={() => {
                                            retryPayment(invoice);
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
                {#if showActions}
                    <TableCell showOverflow right>
                        <DropList bind:show={showDropdown[i]} placement="bottom-start" noArrow>
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
                                    on:click={() => (showDropdown[i] = !showDropdown[i])}
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
                {/if}
            </TableRow>
        {/each}
    </TableBody>
</TableScroll>
