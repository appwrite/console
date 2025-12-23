<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes } from '$lib/stores/billing';
    import { orgMissingPaymentMethod } from '$routes/(console)/store';
</script>

{#if ($orgMissingPaymentMethod.billingPlan === BillingPlan.PRO || $orgMissingPaymentMethod.billingPlan === BillingPlan.SCALE) && !$orgMissingPaymentMethod.paymentMethodId && !$orgMissingPaymentMethod.backupPaymentMethodId && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <HeaderAlert
        type="error"
        title={`Payment method required for ${$orgMissingPaymentMethod.name}`}>
        <svelte:fragment>
            Add a payment method to {$orgMissingPaymentMethod.name} to avoid service interruptions to
            your projects.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button secondary href={`${base}/organization-${$orgMissingPaymentMethod.$id}/billing`}>
                Add payment method
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
