<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { calculateEnterpriseTrial, hideBillingHeaderRoutes } from '$lib/stores/billing';
    import { base } from '$app/paths';
    import { isTabletViewport } from '$lib/stores/viewport';
    import GradientBanner from '$lib/components/billing/gradientBanner.svelte';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    $: upgradeUrl = `${base}/organization-${$organization?.$id}/change-plan`;
    $: remainingDays = calculateEnterpriseTrial($organization);
</script>

{#if $organization?.$id && remainingDays > 0 && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <GradientBanner>
        <Layout.Stack
            gap="m"
            alignItems="center"
            alignContent="space-between"
            direction={$isTabletViewport ? 'column' : 'row'}>
            <Typography.Text>
                Your enterprise trial expires in {remainingDays} days.
            </Typography.Text>

            <Button secondary fullWidthMobile class="u-line-height-1 u-gap-16" href={upgradeUrl}>
                Upgrade
            </Button>
        </Layout.Stack>
    </GradientBanner>
{/if}
