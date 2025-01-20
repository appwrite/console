<script lang="ts">
    import { Alert } from '$lib/components';
    import type { EstimationDeleteOrganization } from '$lib/sdk/billing';
    import RetryPaymentModal from '../billing/retryPaymentModal.svelte';
    import { selectedInvoice, showRetryModal } from '../billing/store';
    import InvoicesTable from './invoicesTable.svelte';

    let error: string = '';
    export let estimation: EstimationDeleteOrganization;
</script>

{#if error}
    <Alert type="error">
        <span>{error}</span>
    </Alert>
{/if}
{#if estimation}
    {#if estimation.unpaidInvoices?.length > 0}
        <Alert type="warning">
            <span slot="title">
                You have a unpaid invoices. Please settle them first in order to delete team.
            </span>
        </Alert>

        <InvoicesTable invoices={estimation.unpaidInvoices} />
    {/if}
{/if}

{#if $selectedInvoice}
    <RetryPaymentModal bind:show={$showRetryModal} bind:invoice={$selectedInvoice} />
{/if}
