<script lang="ts">
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { BillingPlan } from '$lib/constants';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import GradientBanner from '../gradientBanner.svelte';

    function handleClose() {
        const now = new Date().getTime();
        localStorage.setItem('upgradeBanner', now.toString());
        trackEvent('close_upgrade_banner', {
            source: 'upgrade_banner'
        });
    }
</script>

{#if $organization?.$id && $organization?.billingPlan !== BillingPlan.PRO && !$page.url.pathname.includes('/console/account')}
    <GradientBanner
        on:close={handleClose}
        on:click={() => {
            wizard.start(ChangeOrganizationTierCloud);
            trackEvent('click_organization_upgrade', {
                from: 'button',
                source: 'upgrade_banner'
            });
        }}
        buttonText="Upgrade">
        Appwrite Pro is now available!
    </GradientBanner>
{/if}
