<script lang="ts" context="module">
    import { shouldShowNotification } from '$lib/helpers/notifications';

    export const NEW_CONSOLE_BANNER_ID = 'newConsoleBanner';

    /**
     * Account prefs are the source of truth for the snooze: they carry the backoff count and
     * follow the user across devices. This local key only covers the case where that write is
     * rejected, so a dismissal is never silently lost.
     */
    const SNOOZE_FALLBACK_KEY = 'newConsoleBanner:snoozedUntil';
    const SNOOZE_FALLBACK_MS = 7 * 24 * 60 * 60 * 1000;

    export function canShowNewConsoleBanner(): boolean {
        const until = Number(localStorage.getItem(SNOOZE_FALLBACK_KEY) ?? 0);
        if (Number.isFinite(until) && Date.now() < until) return false;

        return shouldShowNotification(NEW_CONSOLE_BANNER_ID);
    }
</script>

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

    async function handleClose() {
        const { id } = $activeHeaderAlert;

        trackEvent('close_new_console_banner', { source: 'new_console_banner' });

        // Clear the store entry, not just this component. headerAlert.get() picks the highest
        // importance and breaks ties by registration order, so an entry left visible keeps
        // winning the importance-1 tie and hides the next eligible promo behind an empty slot.
        headerAlert.updateShow(id, false);

        // A migration runs for months, so dismissal is a snooze rather than a permanent opt-out:
        // a week at first, doubling each time. Someone who keeps closing it stops seeing it, but a
        // single stray click on the X does not remove the message for the whole rollout.
        try {
            await hideNotification(id, { coolOffPeriod: 24 * 7, exponentialBackoff: true });
            localStorage.removeItem(SNOOZE_FALLBACK_KEY);
        } catch {
            // Prefs rejected the write, so the snooze would be lost on the next load. Hold it in
            // this browser instead: a flat week, no backoff, cleared once prefs accept a write.
            localStorage.setItem(SNOOZE_FALLBACK_KEY, String(Date.now() + SNOOZE_FALLBACK_MS));
        }
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
