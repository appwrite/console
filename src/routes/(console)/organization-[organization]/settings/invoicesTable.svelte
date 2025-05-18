<script lang="ts">
    import type { Invoice } from '$lib/sdk/billing';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import { selectedInvoice, showRetryModal } from '../billing/store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Button } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { trackEvent } from '$lib/actions/analytics';
    import { ActionMenu, Badge, Icon, Link, Popover, Table } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconDownload,
        IconExternalLink,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';

    const endpoint = getApiEndpoint();

    export let invoices: Invoice[];
    export let showActions = true;

    function retryPayment(invoice: Invoice) {
        $selectedInvoice = invoice;
        $showRetryModal = true;
    }
</script>

<Table.Root
    columns={[
        { id: 'date', width: { min: 100 } },
        { id: 'status', width: { min: 80 } },
        { id: 'amount_due', width: { min: 100 } },
        showActions && { id: 'action', width: 40 }
    ]}
    let:root>
    <svelte:fragment slot="header" let:root>
        <Table.Header.Cell {root}>Due Date</Table.Header.Cell>
        <Table.Header.Cell {root}>Status</Table.Header.Cell>
        <Table.Header.Cell {root}>Amount Due</Table.Header.Cell>
        {#if showActions}
            <Table.Header.Cell {root} />
        {/if}
    </svelte:fragment>
    {#each invoices as invoice (invoice.$id)}
        {@const status = invoice.status}
        <Table.Row.Base {root}>
            <Table.Cell column="date" {root}>
                {toLocaleDate(invoice.dueAt)}
            </Table.Cell>
            <Table.Cell column="status" {root}>
                {#if invoice?.lastError}
                    <Popover let:toggle>
                        <div>
                            <Badge
                                on:click={toggle}
                                variant="secondary"
                                type={status === 'overdue' ||
                                status === 'failed' ||
                                status === 'requires_authentication'
                                    ? 'error'
                                    : status === 'paid' || status === 'succeeded'
                                      ? 'success'
                                      : 'warning'}
                                content={status === 'requires_authentication' ? 'failed' : status}>
                            </Badge>
                        </div>
                        <svelte:fragment slot="list">
                            <p>
                                The scheduled payment has failed.
                                <Link.Button
                                    on:click={() => {
                                        retryPayment(invoice);
                                    }}
                                    >Try again
                                </Link.Button>
                                .
                            </p>
                        </svelte:fragment>
                    </Popover>
                {:else}
                    <Badge
                        variant="secondary"
                        type={status === 'overdue' ||
                        status === 'failed' ||
                        status === 'requires_authentication'
                            ? 'error'
                            : status === 'paid' || status === 'succeeded'
                              ? 'success'
                              : 'warning'}
                        content={status === 'requires_authentication' ? 'failed' : status}>
                    </Badge>
                {/if}
            </Table.Cell>
            <Table.Cell column="due" {root}>
                {formatCurrency(invoice.grossAmount)}
            </Table.Cell>
            {#if showActions}
                <Table.Cell {root}>
                    <Popover let:toggle>
                        <Button text ariaLabel="More options" on:click={toggle}>
                            <Icon icon={IconDotsHorizontal} />
                        </Button>
                        <svelte:fragment slot="tooltip">
                            <ActionMenu.Root>
                                <ActionMenu.Item.Anchor
                                    trailingIcon={IconExternalLink}
                                    external
                                    href={`${endpoint}/organizations/${page.params.organization}/invoices/${invoice.$id}/view`}>
                                    View invoice
                                </ActionMenu.Item.Anchor>
                                <ActionMenu.Item.Anchor
                                    trailingIcon={IconDownload}
                                    href={`${endpoint}/organizations/${page.params.organization}/invoices/${invoice.$id}/download`}>
                                    Download PDF
                                </ActionMenu.Item.Anchor>
                                {#if status === 'overdue' || status === 'failed'}
                                    <ActionMenu.Item.Button
                                        trailingIcon={IconRefresh}
                                        on:click={() => {
                                            retryPayment(invoice);
                                            trackEvent(`click_retry_payment`, {
                                                from: 'button',
                                                source: 'billing_invoice_menu'
                                            });
                                        }}>
                                        Retry payment
                                    </ActionMenu.Item.Button>
                                {/if}
                            </ActionMenu.Root>
                        </svelte:fragment>
                    </Popover>
                </Table.Cell>
            {/if}
        </Table.Row.Base>
    {/each}
</Table.Root>
