<script lang="ts">
    import { page } from '$app/stores';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { HeaderAlert } from '$lib/layout';
    import { orgMissingPaymentMethod } from '$routes/console/store';
</script>

{#if ($orgMissingPaymentMethod.billingPlan === BillingPlan.PRO || $orgMissingPaymentMethod.billingPlan === BillingPlan.SCALE) && !$orgMissingPaymentMethod.paymentMethodId && !$orgMissingPaymentMethod.backupPaymentMethodId && !$page.url.pathname.includes('/console/account')}
    <HeaderAlert
        type="error"
        title={`Payment method required for ${$orgMissingPaymentMethod.name}`}>
        <svelte:fragment>
            Add a payment method to {$orgMissingPaymentMethod.name} before {toLocaleDate(
                $orgMissingPaymentMethod.billingCurrentInvoiceDate
            )} to avoid service interruptions to your projects.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button
                secondary
                href={`/console/organization-${$orgMissingPaymentMethod.$id}/billing#payment-methods`}>
                Add payment method
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
