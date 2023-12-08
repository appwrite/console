<script lang="ts">
    // import { base } from '$app/paths';
    // import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { failedInvoice } from '$lib/stores/billing';
</script>

{#if $failedInvoice}
    <HeaderAlert title="You are limited to one free organization per account">
        <svelte:fragment>
            All but one organization will be automatically upgraded to a Pro plan on <b
                >01 Feb 2024</b
            >. You can add a payment method or transfer projects from your settings.
        </svelte:fragment>
        <!-- <svelte:fragment slot="buttons">
            <Button
                href={`${base}/console/organization-${$failedInvoice?.teamId}/billing#paymentMethods`}
                secondary
                fullWidthMobile>
                <span class="text">Update billing details</span>
            </Button>
        </svelte:fragment> -->
    </HeaderAlert>
{/if}
