<script lang="ts" context="module">
    import { shouldShowNotification } from '$lib/helpers/notifications';
    import { isLocallySnoozed, readLocalSnooze } from '$lib/helpers/localSnooze';

    export const NEW_CONSOLE_BANNER_ID = 'newConsoleBanner';

    /**
     * Account prefs are the source of truth for the snooze: they carry the hide count and follow
     * the user across devices. This local key only covers a rejected prefs write, so a dismissal
     * is never silently lost.
     */
    export const SNOOZE_FALLBACK_KEY = 'newConsoleBanner:snooze';
    export const SNOOZE_COOL_OFF_HOURS = 24 * 7;

    export function canShowNewConsoleBanner(): boolean {
        if (isLocallySnoozed(readLocalSnooze(SNOOZE_FALLBACK_KEY), Date.now())) return false;

        return shouldShowNotification(NEW_CONSOLE_BANNER_ID);
    }
</script>

<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { hideNotification } from '$lib/helpers/notifications';
    import { clearLocalSnooze, nextLocalSnooze, writeLocalSnooze } from '$lib/helpers/localSnooze';
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
            await hideNotification(id, {
                coolOffPeriod: SNOOZE_COOL_OFF_HOURS,
                exponentialBackoff: true
            });
            clearLocalSnooze(SNOOZE_FALLBACK_KEY);
        } catch {
            // Prefs rejected the write, so the snooze would be lost on the next load. Hold it in
            // this browser instead, escalating on the same curve so repeated failures continue
            // the sequence rather than restarting at a week. Cleared once a write succeeds.
            writeLocalSnooze(
                SNOOZE_FALLBACK_KEY,
                nextLocalSnooze(
                    readLocalSnooze(SNOOZE_FALLBACK_KEY),
                    SNOOZE_COOL_OFF_HOURS,
                    Date.now()
                )
            );
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
