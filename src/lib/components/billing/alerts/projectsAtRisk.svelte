<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { diffDays, toLocaleDate } from '$lib/helpers/date';
    import { HeaderAlert } from '$lib/layout';
    import { failedInvoice, hideBillingHeaderRoutes } from '$lib/stores/billing';
</script>

{#if $failedInvoice && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    {@const daysPassed = diffDays(new Date($failedInvoice.dueAt), new Date())}
    <HeaderAlert title="Your projects are at risk">
        <svelte:fragment>
            {#if daysPassed > 30}
                Your scheduled payment on <b>{toLocaleDate($failedInvoice?.dueAt)}</b> failed. To resume
                write access of your organization, please update your billing details.
            {:else}
                Your scheduled payment on <b>{toLocaleDate($failedInvoice?.dueAt)}</b> failed. Access
                to paid projects within this organization will be disabled if no action is taken within
                30 days.
            {/if}
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button
                href={`${base}/organization-${$failedInvoice?.teamId}/billing#paymentMethods`}
                secondary
                fullWidthMobile>
                <span class="text">Update billing details</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
