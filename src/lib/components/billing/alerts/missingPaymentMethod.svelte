<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes } from '$lib/stores/billing';
    import { orgMissingPaymentMethod } from '$routes/(console)/store';

    // exists
    $: hasOrgBillingContext = !!$orgMissingPaymentMethod;

    // needs any methods
    $: requiresPaymentMethod =
        hasOrgBillingContext && $orgMissingPaymentMethod.billingPlanDetails.requiresPaymentMethod;

    // has any methods
    $: hasAnyPaymentMethod =
        hasOrgBillingContext &&
        (!!$orgMissingPaymentMethod.paymentMethodId ||
            !!$orgMissingPaymentMethod.backupPaymentMethodId);

    // is url excluded
    $: isBillingHeaderHidden = hideBillingHeaderRoutes.includes(page.url.pathname);

    // should show header
    $: shouldShowBillingHeader =
        hasOrgBillingContext &&
        requiresPaymentMethod &&
        !hasAnyPaymentMethod &&
        !isBillingHeaderHidden;
</script>

{#if shouldShowBillingHeader}
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
