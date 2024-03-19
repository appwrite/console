<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { HeaderAlert } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
</script>

{#if !$page.url.pathname.includes('/console/account')}
    <HeaderAlert title={`Payment method required for ${$organization.name}`}>
        <svelte:fragment>
            Add a payment method to {$organization.name} before {toLocaleDate(
                $organization.billingCurrentInvoiceDate
            )} to avoid service interruptions to your projects.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button
                href={`${base}/console/organization-${$organization.$id}/billing#paymentMethods`}
                secondary
                fullWidthMobile>
                <span class="text">Add payment method</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
