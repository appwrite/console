<script lang="ts">
    import { Alert } from '@appwrite.io/pink-svelte';
    import type { EstimationDeleteOrganization } from '$lib/sdk/billing';
    import InvoicesTable from './invoicesTable.svelte';
    export let estimation: EstimationDeleteOrganization;
</script>

{#if estimation}
    {#if estimation.unpaidInvoices?.length > 0}
        <Alert.Inline status="warning">
            This organization has unresolved invoices that must be settled before it can be deleted.
            Please review and resolve these invoices to proceed.
        </Alert.Inline>

        <InvoicesTable invoices={estimation.unpaidInvoices} showActions={false} />
    {/if}
{/if}
