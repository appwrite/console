<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import PlanExcess from './planExcess.svelte';
    import { changeOrganizationTier } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >Your usage exceeds the limits of the {tierToPlan($organization.billingPlan).name} plan</svelte:fragment>
    <svelte:fragment slot="subtitle">
        View the current usage for <b>{$organization.name}</b> and where you will exceed the limits of
        your new plan.
    </svelte:fragment>

    <PlanExcess
        excess={$changeOrganizationTier.limitOverflow}
        currentTier={$changeOrganizationTier.billingPlan} />
</WizardStep>
