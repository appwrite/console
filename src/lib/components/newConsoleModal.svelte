<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { hideNotification } from '$lib/helpers/notifications';
    import NewConsoleCover from '$lib/images/promos/new-console-modal.png';
    import { Alert, Icon, Typography } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight, IconX } from '@appwrite.io/pink-icons-svelte';

    export let show = false;

    // TODO: replace with the confirmed retirement date once it is set.
    const SUNSET_NOTE = 'The old Console will be retired in the coming weeks.';

    // utm_medium separates this from the banner and the promo card.
    const href =
        'https://appwrite.io/?utm_source=old-console&utm_medium=modal&utm_campaign=new-console';

    // The most interruptive of the three surfaces, so it snoozes for a month rather than the
    // banner's week, and still doubles on each dismissal.
    const COOL_OFF_HOURS = 24 * 30;

    let recorded = false;

    function close(action: 'try' | 'continue') {
        if (!recorded) {
            recorded = true;
            trackEvent('close_new_console_modal', { source: 'new_console_modal', action });
            hideNotification('newConsoleModal', {
                coolOffPeriod: COOL_OFF_HOURS,
                exponentialBackoff: true
            });
        }

        show = false;
    }

    function onKeydown(event: KeyboardEvent) {
        if (show && event.key === 'Escape') close('continue');
    }

    // Moves the reading cursor into the dialog so Escape and the actions are reachable at once.
    function focusOnMount(node: HTMLElement) {
        node.focus({ preventScroll: true });
    }
</script>

<svelte:window on:keydown={onKeydown} />

{#if show}
    <div
        class="scrim"
        role="presentation"
        onclick={(event) => {
            if (event.target === event.currentTarget) close('continue');
        }}>
        <div
            class="dialog"
            role="dialog"
            tabindex="-1"
            aria-modal="true"
            aria-labelledby="new-console-title"
            use:focusOnMount>
            <button
                class="dismiss"
                type="button"
                aria-label="Close"
                onclick={() => close('continue')}>
                <Icon icon={IconX} size="s" />
            </button>

            <img class="cover" src={NewConsoleCover} alt="" />

            <div class="body">
                <h2 id="new-console-title">The new Appwrite Console</h2>
                <p class="lede">
                    Faster, redesigned, and everything you're working on comes with you. Nothing to
                    migrate.
                </p>

                <div class="notice">
                    <Alert.Inline status="info">
                        <Typography.Text>
                            {SUNSET_NOTE} You can switch over any time from the top bar.
                        </Typography.Text>
                    </Alert.Inline>
                </div>
            </div>

            <div class="actions">
                <Button
                    {href}
                    external
                    on:click={() => {
                        trackEvent('click_new_console', { source: 'new_console_modal' });
                        close('try');
                    }}>
                    Take me to the new Console
                    <Icon icon={IconArrowSmRight} size="s" slot="end" />
                </Button>

                <Button text on:click={() => close('continue')}>Stay here for now</Button>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .scrim {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: grid;
        place-items: center;
        padding: var(--space-6, 12px);
        overflow-y: auto;
        background: var(--overlay-scrim);
        backdrop-filter: blur(4px);
    }

    .dialog {
        position: relative;
        inline-size: min(100%, 30rem);
        overflow: hidden;
        outline: none;
        border-radius: var(--border-radius-m, 12px);
        border: var(--border-width-s, 1px) solid var(--border-neutral);
        background: var(--bgcolor-neutral-primary);
        box-shadow: 0 24px 64px rgb(0 0 0 / 24%);
    }

    /* The source is a wide 2400x1260 capture, so it is cropped rather than letterboxed. */
    .cover {
        display: block;
        inline-size: 100%;
        block-size: 11rem;
        object-fit: cover;
        object-position: center;
        border-block-end: var(--border-width-s, 1px) solid var(--border-neutral);
    }

    .body {
        padding: var(--space-9, 24px) var(--space-9, 24px) 0;
    }

    h2 {
        margin: 0 0 var(--space-3, 6px);
        font-size: var(--font-size-l, 20px);
        font-weight: 600;
        line-height: 1.3;
        color: var(--fgcolor-neutral-primary);
    }

    .lede {
        margin: 0;
        font-size: var(--font-size-s, 14px);
        line-height: 1.6;
        color: var(--fgcolor-neutral-secondary);
        text-wrap: pretty;
    }

    .notice {
        margin-block-start: var(--space-7, 16px);
    }

    .actions {
        display: flex;
        align-items: center;
        gap: var(--space-4, 8px);
        padding: var(--space-8, 20px) var(--space-9, 24px) var(--space-9, 24px);
    }

    .dismiss {
        position: absolute;
        z-index: 2;
        inset-block-start: var(--space-5, 10px);
        inset-inline-end: var(--space-5, 10px);
        display: grid;
        place-items: center;
        inline-size: 28px;
        block-size: 28px;
        border: none;
        border-radius: var(--border-radius-xs, 6px);
        background: rgb(0 0 0 / 35%);
        color: #fff;
        cursor: pointer;

        &:hover {
            background: rgb(0 0 0 / 55%);
        }

        &:focus-visible {
            outline: 2px solid var(--border-accent);
            outline-offset: 2px;
        }
    }

    @media (max-width: 768px) {
        .actions {
            flex-direction: column;
            align-items: stretch;
        }
    }
</style>
