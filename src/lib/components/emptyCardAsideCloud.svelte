<script>
    import { trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { getNextTier, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import Card from './card.svelte';

    export let source = 'empty_state_card';
</script>

<Card>
    <div class="u-flex u-flex-vertical u-gap-8 u-cross-center u-main-center">
        <p class="text u-bold">
            <slot name="title" />
        </p>
        <p class="text">
            <slot nextTier={tierToPlan(getNextTier($organization.billingPlan)).name} />
        </p>
        <Button
            class="u-margin-block-start-32"
            secondary
            on:click={() => {
                wizard.start(ChangeOrganizationTierCloud);
                trackEvent('click_organization_upgrade', {
                    from: 'button',
                    source
                });
            }}>Upgrade plan</Button>
    </div>
</Card>
