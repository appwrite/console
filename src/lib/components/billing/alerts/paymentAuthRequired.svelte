<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { actionRequiredInvoices, hideBillingHeaderRoutes } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { getApiEndpoint } from '$lib/stores/sdk';
    const endpoint = getApiEndpoint();
</script>

{#if $actionRequiredInvoices && $actionRequiredInvoices?.invoices?.length && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <HeaderAlert title="Authorization required" type="error">
        Please authorize your upcoming payment for {$organization.name}. Your bank requires this
        security measure to proceed with payment.
        <svelte:fragment slot="buttons">
            <Button
                text
                href={`${endpoint}/organizations/${$organization.$id}/invoices/${$actionRequiredInvoices.invoices[0].$id}/view`}>
                View invoice
            </Button>
            <Button
                secondary
                href={`${base}/organization-${$organization.$id}/billing?type=confirmation&invoice=${$actionRequiredInvoices.invoices[0].$id}`}>
                Authorize payment
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
