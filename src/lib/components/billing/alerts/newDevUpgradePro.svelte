<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import GradientBanner from '../gradientBanner.svelte';

    let show = true;

    function handleClose() {
        show = false;
        const now = new Date().getTime();
        localStorage.setItem($activeHeaderAlert.id, now.toString());
        trackEvent('close_upgrade_banner', {
            source: 'cloud_credits_banner',
            campaign: 'WelcomeManual'
        });
    }
</script>

{#if show && $organization?.$id && $organization?.billingPlan === BillingPlan.FREE && !$page.url.pathname.includes('/console/account')}
    <GradientBanner on:close={handleClose}>
        <div class="u-flex u-gap-24 u-main-center u-cross-center u-flex-vertical-mobile">
            <span class="body-text-1">Get $50 Cloud credits for Appwrite Pro.</span>
            <Button
                secondary
                fullWidthMobile
                class="u-line-height-1"
                href={`${base}/apply-credit?code=appw50&org=${$organization.$id}`}
                on:click={() => {
                    trackEvent(Click.CreditsRedeemClick, {
                        from: 'button',
                        source: 'cloud_credits_banner',
                        campaign: 'WelcomeManual'
                    });
                }}>
                Claim credits
            </Button>
        </div>
    </GradientBanner>
{/if}
