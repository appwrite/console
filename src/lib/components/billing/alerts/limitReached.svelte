<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes, readOnly, tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
</script>

{#if $organization?.$id && $organization?.billingPlan === BillingPlan.FREE && $readOnly && !hideBillingHeaderRoutes.includes($page.url.pathname)}
    <HeaderAlert
        type="error"
        title={`${$organization.name} usage has reached the ${tierToPlan($organization.billingPlan).name} plan limit`}>
        <svelte:fragment>
            Usage for the <b>{$organization.name}</b> organization has reached the limits of the {tierToPlan(
                $organization.billingPlan
            ).name}
            plan. Consider upgrading to increase your resource usage.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button href={`${base}/organization-${$organization.$id}/usage`} text fullWidthMobile>
                <span class="text">View usage</span>
            </Button>
            <Button
                href={$upgradeURL}
                on:click={() => {
                    trackEvent(Click.OrganizationClickUpgrade, {
                        from: 'button',
                        source: 'limit_reached_banner'
                    });
                }}
                secondary
                fullWidthMobile>
                <span class="text">Upgrade plan</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
