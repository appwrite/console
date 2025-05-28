<script lang="ts">
    import { page } from '$app/state';
    import { CardGrid, PaginationInline } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Invoice, InvoiceList } from '$lib/sdk/billing';
    import { getApiEndpoint, sdk } from '$lib/stores/sdk';
    import { Query } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { selectedInvoice, showRetryModal } from './store';
    import {
        ActionMenu,
        Badge,
        Card,
        Empty,
        Icon,
        Layout,
        Link,
        Popover,
        Table
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconDownload,
        IconExternalLink,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';

    let offset = 0;
    let invoiceList: InvoiceList = {
        invoices: [],
        total: 0
    };

    const limit = 5;
    const endpoint = getApiEndpoint();

    onMount(request);

    async function request() {
        // isLoadingInvoices = true;
        invoiceList = await sdk.forConsole.billing.listInvoices(page.params.organization, [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ]);
    }

    $: if (page.url.searchParams.get('type') === 'validate-invoice') {
        window.history.replaceState({}, '', page.url.pathname);
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
    <svelte:fragment slot="title">Payment history</svelte:fragment>
    Transaction history for this organization. Download invoices for more details about your payments.
    <svelte:fragment slot="aside">
        {#if invoiceList.total > 0}
            <Table.Root
                let:root
                columns={[
                    { id: 'dueDate' },
                    { id: 'status', width: { min: 200 } },
                    { id: 'amount', width: { min: 120 } },
                    { id: 'action', width: 40 }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="dueDate" {root}>Due date</Table.Header.Cell>
                    <Table.Header.Cell column="status" {root}>Status</Table.Header.Cell>
                    <Table.Header.Cell column="amount" {root}>Amount due</Table.Header.Cell>
                    <Table.Header.Cell column="action" {root} />
                </svelte:fragment>
                {#each invoiceList?.invoices as invoice}
                    {@const status = invoice.status}
                    <Table.Row.Base {root}>
                        <Table.Cell column="dueDate" {root}>
                            {toLocaleDate(invoice.dueAt)}
                        </Table.Cell>
                        <Table.Cell column="status" {root}>
                            {@const isDanger =
                                status === 'overdue' ||
                                status === 'failed' ||
                                status === 'requires_authentication'}
                            {@const isSuccess = status === 'paid' || status === 'succeeded'}
                            {@const isWarning = status === 'pending'}
                            <Layout.Stack direction="row" gap="s">
                                <Badge
                                    variant="secondary"
                                    content={status === 'requires_authentication'
                                        ? 'failed'
                                        : status}
                                    type={isDanger
                                        ? 'error'
                                        : isWarning
                                          ? 'warning'
                                          : isSuccess
                                            ? 'success'
                                            : undefined} />
                                {#if invoice?.lastError}
                                    <Popover let:toggle>
                                        <Link.Button on:click={toggle}>Details</Link.Button>
                                        <svelte:fragment slot="tooltip">
                                            The scheduled payment has failed.
                                            <Link.Button on:click={() => retryPayment(invoice)}
                                                >Try again
                                            </Link.Button>
                                        </svelte:fragment>
                                    </Popover>
                                {/if}
                            </Layout.Stack>
                        </Table.Cell>
                        <Table.Cell column="amount" {root}>
                            {formatCurrency(invoice.grossAmount)}
                        </Table.Cell>
                        <Table.Cell column="status" {root}>
                            <Popover let:toggle placement="bottom-start" padding="none">
                                <Button text icon ariaLabel="more options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip">
                                    <!-- todo: add missing event -->
                                    <ActionMenu.Item.Anchor
                                        leadingIcon={IconExternalLink}
                                        external
                                        href={`${endpoint}/organizations/${page.params.organization}/invoices/${invoice.$id}/view`}>
                                        View invoice
                                    </ActionMenu.Item.Anchor>
                                    <ActionMenu.Item.Anchor
                                        leadingIcon={IconDownload}
                                        href={`${endpoint}/organizations/${page.params.organization}/invoices/${invoice.$id}/download`}>
                                        Download PDF
                                    </ActionMenu.Item.Anchor>
                                    {#if status === 'overdue' || status === 'failed'}
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconRefresh}
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
                            </Popover>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
            {#if invoiceList.total > limit}
                <div class="u-flex u-main-space-between">
                    <p class="text">Total results: {invoiceList.total}</p>
                    <PaginationInline {limit} bind:offset total={invoiceList.total} hidePages />
                </div>
            {/if}
        {:else}
            <Card.Base>
                <Empty
                    type="secondary"
                    title="You have no payment history."
                    description="After you receive your first invoice, you'll see it here." />
            </Card.Base>
        {/if}
    </svelte:fragment>
</CardGrid>
