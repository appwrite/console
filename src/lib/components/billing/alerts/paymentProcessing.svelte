<script lang="ts">
    import { page } from '$app/state';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes, teamStatusUpgrading } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
</script>

{#if $organization?.$id && $organization?.status === teamStatusUpgrading && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <HeaderAlert title="Payment is processing" type="info">
        Your plan will activate within a few minutes. You can keep using {$organization.name} while we
        confirm the charge with your bank.
    </HeaderAlert>
{/if}
