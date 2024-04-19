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

<Card style="--card-padding:1.5rem;">
    <div class="u-flex u-gap-24 u-flex-vertical-mobile">
        {#if $$slots?.image}
            <div class="u-stretch">
                <div class="file-preview u-width-full-line u-height-100-percent">
                    <slot name="image" />
                </div>
            </div>
        {/if}
        <div class="u-stretch u-flex-vertical">
            <h3 class="body-text-2 u-bold"><slot name="title" /></h3>
            <p class="u-margin-block-start-8">
                <slot nextTier={tierToPlan(getNextTier($organization.billingPlan)).name} />
            </p>
            <Button
                class="u-margin-block-start-32"
                secondary
                fullWidth
                on:click={() => {
                    wizard.start(ChangeOrganizationTierCloud);
                    trackEvent('click_organization_upgrade', {
                        from: 'button',
                        source
                    });
                }}>Upgrade plan</Button>
        </div>
    </div>
</Card>
