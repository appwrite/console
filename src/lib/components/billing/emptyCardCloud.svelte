<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { BillingPlan } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import { tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { Card } from '..';

    export let service: string;
    export let eventSource: string;
</script>

<Card>
    <slot>
        <div class="u-flex u-flex-vertical u-main-center u-cross-center u-gap-8">
            <h6 class="body-text-1 u-bold u-trim-1">Upgrade to add {service}</h6>
            <p class="text u-text-center">
                Upgrade to a {tierToPlan(BillingPlan.Tier1).name} plan to add {service} to your organization
            </p>

            <Button
                class="u-margin-block-start-16"
                secondary
                fullWidthMobile
                href={$upgradeURL}
                on:click={() => {
                    trackEvent('click_organization_upgrade', {
                        from: 'button',
                        source: eventSource
                    });
                }}>
                Upgrade
            </Button>
        </div>
    </slot>
</Card>
