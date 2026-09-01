<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import GradientBanner from './billing/gradientBanner.svelte';

    // utm_medium separates this from the promo card, so the two surfaces can be compared.
    const href =
        'https://appwrite.io/?utm_source=old-console&utm_medium=banner&utm_campaign=new-console';

    let show = true;

    function handleClose() {
        show = false;
        localStorage.setItem($activeHeaderAlert.id, new Date().getTime().toString());
        trackEvent('close_new_console_banner', { source: 'new_console_banner' });
    }
</script>

{#if show}
    <GradientBanner on:close={handleClose}>
        <Layout.Stack
            gap="m"
            alignItems="center"
            alignContent="center"
            direction={$isSmallViewport ? 'column' : 'row'}>
            <Typography.Text>
                Introducing the new Appwrite Console, rebuilt from the ground up.
            </Typography.Text>

            <Button
                secondary
                external
                fullWidthMobile
                class="u-line-height-1"
                {href}
                on:click={() => trackEvent('click_new_console', { source: 'new_console_banner' })}>
                Try it now
            </Button>
        </Layout.Stack>
    </GradientBanner>
{/if}
