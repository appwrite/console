<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { BillingPlan, NEW_DEV_PRO_UPGRADE_COUPON } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import GradientBanner from '../gradientBanner.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

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

{#if show && $organization?.$id && $organization?.billingPlan === BillingPlan.FREE && !page.url.pathname.includes('/console/account')}
    <GradientBanner on:close={handleClose}>
        <Layout.Stack
            gap="m"
            alignItems="center"
            alignContent="center"
            direction={$isSmallViewport ? 'column' : 'row'}>

            <Typography.Text>Get $50 Cloud credits for Appwrite Pro.</Typography.Text>

            <Button
                secondary
                fullWidthMobile
                class="u-line-height-1"
                href={`${base}/apply-credit?code=${NEW_DEV_PRO_UPGRADE_COUPON}&org=${$organization.$id}`}
                on:click={() => {
                    trackEvent(Click.CreditsRedeemClick, {
                        from: 'button',
                        source: 'cloud_credits_banner',
                        campaign: 'WelcomeManual'
                    });
                }}>
                Claim credits
            </Button>
        </Layout.Stack>
    </GradientBanner>
{/if}
