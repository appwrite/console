<script lang="ts">
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { BillingPlan } from '$lib/constants';
    import { upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import GradientBanner from '../gradientBanner.svelte';

    let show = true;

    function handleClose() {
        show = false;
        const now = new Date().getTime();
        localStorage.setItem('upgradeBanner', now.toString());
        trackEvent('close_upgrade_banner', {
            source: 'upgrade_banner'
        });
    }
</script>

{#if show && $organization?.$id && $organization?.billingPlan === BillingPlan.FREE && !$page.url.pathname.includes('/console/account')}
    <GradientBanner
        on:close={handleClose}
        on:click={() => {
            trackEvent('click_organization_upgrade', {
                from: 'button',
                source: 'upgrade_banner'
            });
        }}
        href={$upgradeURL}
        buttonText="Upgrade">
        Appwrite Pro is now available!
    </GradientBanner>
{/if}
