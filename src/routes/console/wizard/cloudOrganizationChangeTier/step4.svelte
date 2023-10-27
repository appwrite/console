<script lang="ts">
    import { Alert } from '$lib/components';

    import { WizardStep } from '$lib/layout';
    import { plansInfo, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';

    $: console.log($organization);
    $: console.log($plansInfo);
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >Your usage exceeds the limits of the {tierToPlan($organization.billingPlan)} plan</svelte:fragment>
    <svelte:fragment slot="subtitle">
        View the current usage for <b>{$organization.name}</b> and where you will exceed the limits of
        your new plan.
    </svelte:fragment>

    <Alert type="error">
        <svelte:fragment slot="title">
            Changing your plan now will result in removal of organization members and more
        </svelte:fragment>
    </Alert>
</WizardStep>
