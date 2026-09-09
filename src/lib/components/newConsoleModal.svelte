<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { hideNotification } from '$lib/helpers/notifications';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let show = false;

    // utm_medium separates this from the banner and the promo card.
    const href =
        'https://appwrite.io/?utm_source=old-console&utm_medium=modal&utm_campaign=new-console';

    // The most interruptive of the three surfaces, so it snoozes for a month rather than the
    // banner's week, and still doubles on each dismissal.
    const COOL_OFF_HOURS = 24 * 30;

    let recorded = false;

    function record(action: 'try' | 'continue') {
        if (recorded) return;
        recorded = true;

        trackEvent('close_new_console_modal', { source: 'new_console_modal', action });
        hideNotification('newConsoleModal', {
            coolOffPeriod: COOL_OFF_HOURS,
            exponentialBackoff: true
        });
    }

    // `show` starts false and is flipped on by the parent, so a bare `if (!show)` would fire on
    // mount and snooze the modal before it was ever seen. Only treat it as an exit once it has
    // actually been open.
    let wasShown = false;
    $: if (show) wasShown = true;

    // Catches every exit: the close button, Escape, the backdrop, and the footer button. Whatever
    // route the user takes out of the modal counts as choosing to stay on the old Console.
    $: if (wasShown && !show) record('continue');
</script>

<!-- autoClose={false}: Modal closes itself on navigation, and this component treats any
     close as the user choosing to stay on the old Console. Navigating is not a choice. -->
<Modal bind:show autoClose={false} size="m" title="Try the new Appwrite Console">
    <Typography.Text>
        We rebuilt the Console from the ground up. It's faster, it's cleaner, and everything you're
        working on comes with you. Nothing to migrate.
    </Typography.Text>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Continue with the old Console</Button>

        <Button
            {href}
            external
            on:click={() => {
                record('try');
                show = false;
            }}>
            Try the new Console
        </Button>
    </svelte:fragment>
</Modal>
