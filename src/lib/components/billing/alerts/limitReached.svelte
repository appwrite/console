<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { readOnly, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/(console)/changeOrganizationTierCloud.svelte';
</script>

{#if $organization?.$id && $organization?.billingPlan === BillingPlan.STARTER && $readOnly && !$page.url.pathname.includes(`${base}/account`)}
    <HeaderAlert
        type="error"
        title={`${$organization.name} usage has reached the ${tierToPlan($organization.billingPlan).name} plan limit`}>
        <svelte:fragment>
            Usage for the <b>{$organization.name}</b> organization has reached the limits of the Starter
            plan. Consider upgrading to increase your resource usage.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button href={`${base}/organization-${$organization?.$id}/usage`} text fullWidthMobile>
                <span class="text">View usage</span>
            </Button>
            <Button
                on:click={() => {
                    wizard.start(ChangeOrganizationTierCloud);
                    trackEvent('click_organization_upgrade', {
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
