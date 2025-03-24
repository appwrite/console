<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { HeaderAlert } from '$lib/layout';
    import {
        billingLimitOutstandingInvoice,
        hideBillingHeaderRoutes,
        readOnly,
        teamStatusReadonly
    } from '$lib/stores/billing';
    import { base } from '$app/paths';

    $: redirectUrl = `${base}/organization-${$organization.$id}/billing#payment-history`;
</script>

{#if $organization?.$id && $organization?.status === teamStatusReadonly && $organization?.remarks === billingLimitOutstandingInvoice && $readOnly && !hideBillingHeaderRoutes.includes($page.url.pathname)}
    <HeaderAlert type="error" title="Access restricted">
        <svelte:fragment>
            Access to your organization resources has been restricted as you have unpaid invoices.
            Please pay the invoice to restore access.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button secondary fullWidthMobile href={redirectUrl}>
                <span class="text">View invoices</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
