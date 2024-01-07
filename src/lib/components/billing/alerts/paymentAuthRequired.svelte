<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { actionRequiredInvoices } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { VARS } from '$lib/system';

    const endpoint = VARS.APPWRITE_ENDPOINT ?? `${$page.url.origin}/v1`;
</script>

{#if $actionRequiredInvoices && $actionRequiredInvoices?.invoices?.length && !$page.url.pathname.includes('/console/account')}
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
                href={`/console/organization-${$organization.$id}/billing?type=confirmation&invoice=${$actionRequiredInvoices.invoices[0].$id}`}>
                Authorize payment
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
