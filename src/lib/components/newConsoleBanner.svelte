<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { hideNotification } from '$lib/helpers/notifications';
    import { headerAlert } from '$lib/stores/headerAlert';
    import { activeHeaderAlert } from '$routes/(console)/store';
    import GradientBanner from './billing/gradientBanner.svelte';

    // utm_medium separates this from the promo card, so the two surfaces can be compared.
    const href =
        'https://appwrite.io/?utm_source=old-console&utm_medium=banner&utm_campaign=new-console';

    function handleClose() {
        const { id } = $activeHeaderAlert;

        // A migration runs for months, so dismissal is a snooze rather than a permanent opt-out:
        // a week at first, doubling each time. Someone who keeps closing it stops seeing it, but a
        // single stray click on the X does not remove the message for the whole rollout.
        hideNotification(id, { coolOffPeriod: 24 * 7, exponentialBackoff: true });
        trackEvent('close_new_console_banner', { source: 'new_console_banner' });

        // Clear the store entry, not just this component. headerAlert.get() picks the highest
        // importance and breaks ties by registration order, so an entry left visible keeps
        // winning the importance-1 tie and hides the next eligible promo behind an empty slot.
        headerAlert.updateShow(id, false);
    }
</script>

<GradientBanner on:close={handleClose}>
    <Layout.Stack
        gap="m"
        alignItems="center"
        alignContent="center"
        justifyContent="center"
        direction={$isTabletViewport ? 'column' : 'row'}>
        <Typography.Text align={$isTabletViewport ? 'center' : 'start'}>
            Introducing the new Appwrite Console, rebuilt from the ground up.
        </Typography.Text>

        <Button
            secondary
            external
            class="u-line-height-1"
            {href}
            on:click={() => trackEvent('click_new_console', { source: 'new_console_banner' })}>
            Try it now
        </Button>
    </Layout.Stack>
</GradientBanner>
