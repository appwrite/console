<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { calculateEnterpriseTrial, hideBillingHeaderRoutes } from '$lib/stores/billing';
    import { base } from '$app/paths';

    import { onDestroy, onMount } from 'svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import GradientBanner from '$lib/components/billing/gradientBanner.svelte';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    let container: HTMLElement | null = null;

    function setNavigationHeight() {
        const alertHeight = container ? container.getBoundingClientRect().height : 0;
        const header: HTMLHeadingElement = document.querySelector('main > header');
        const sidebar: HTMLElement = document.querySelector('main > div > nav');
        const contentSection: HTMLElement = document.querySelector('main > div > section');

        if (header) {
            header.style.top = `${alertHeight}px`;
        }
        if (sidebar) {
            sidebar.style.top = `${alertHeight + ($isTabletViewport ? 0 : header.getBoundingClientRect().height)}px`;
            sidebar.style.height = `calc(100vh - (${alertHeight + ($isTabletViewport ? 0 : header.getBoundingClientRect().height)}px))`;
        }
        if (contentSection) {
            contentSection.style.paddingBlockStart = `${alertHeight}px`;
        }
    }

    onMount(() => {
        setNavigationHeight();
    });

    onDestroy(() => {
        container = null;
        setNavigationHeight();
    });

    $: upgradeUrl = `${base}/organization-${$organization?.$id}/billing`;
    $: remainingDays = calculateEnterpriseTrial($organization);
</script>

<svelte:window on:resize={setNavigationHeight} />
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


            <Button
                secondary
                fullWidthMobile
                class="u-line-height-1 u-gap-16"
                href={upgradeUrl}>
                Upgrade
            </Button>
        </Layout.Stack>
    </GradientBanner>
{/if}
