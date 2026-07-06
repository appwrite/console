<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Card, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { IconCheck, IconX, IconLockClosed } from '@appwrite.io/pink-icons-svelte';
    import { Button } from '$lib/elements/forms';
    import type { OAuth2Flow, OAuth2Outcome } from './consent-card.svelte';

    interface Props {
        outcome: OAuth2Outcome;
        flow: OAuth2Flow;
        app?: Models.App | null;
        accountLabel?: string;
        /**
         * Present when the client redirect is a native deep link (cursor://…).
         * The browser already attempted it once; the button retries it for users
         * who dismissed the OS "open application" prompt.
         */
        redirectUrl?: string;
    }

    let {
        outcome,
        flow,
        app = null,
        accountLabel = undefined,
        redirectUrl = undefined
    }: Props = $props();

    const approved = $derived(outcome === 'approved');
    const appName = $derived(app?.name ?? 'the application');
    const appInitial = $derived((app?.name || '?').charAt(0).toUpperCase());
    const accountInitial = $derived((accountLabel || '?').charAt(0).toUpperCase());

    const title = $derived(
        approved ? (flow === 'device' ? 'Device connected' : 'Access granted') : 'Request cancelled'
    );

    const message = $derived.by(() => {
        if (!approved) {
            return `No access was granted to ${appName}. You can close this tab.`;
        }
        if (flow === 'device') {
            return `You've authorized ${appName}. Return to your device — it will continue automatically.`;
        }
        if (redirectUrl) {
            return `Return to ${appName} to continue. If it didn't open automatically, use the button below.`;
        }
        return `Return to ${appName} to continue. You can close this tab.`;
    });
</script>

<Card.Base padding="none" radius="l" style="width: 100%; overflow: hidden;">
    <div class="outcome" class:approved>
        <header class="header">
            <div class="identity">
                {#if app?.logoUri}
                    <img src={app.logoUri} alt={appName} class="avatar" />
                {:else}
                    <div class="avatar placeholder">{appInitial}</div>
                {/if}
                <span class="connector">
                    <span class="connector-line"></span>
                    <span class="connector-node">
                        <Icon icon={approved ? IconCheck : IconX} size="s" />
                    </span>
                    <span class="connector-line"></span>
                </span>
                <div class="avatar account">{accountInitial}</div>
            </div>

            <div class="headline">
                <Typography.Title size="m" align="center">{title}</Typography.Title>
                <Typography.Text variant="m-400" align="center" color="--fgcolor-neutral-secondary">
                    {message}
                </Typography.Text>
            </div>
        </header>

        <div class="body">
            {#if approved && redirectUrl}
                <Button fullWidth on:click={() => (window.location.href = redirectUrl)}>
                    Open {app?.name ?? 'application'}
                </Button>
                <p class="close-hint">It's safe to close this tab.</p>
            {/if}

            <p class="footnote">
                <Icon icon={IconLockClosed} size="s" />
                {#if approved}
                    <span>You can revoke access anytime in your account settings</span>
                {:else}
                    <span>{appName} was not given access to your account</span>
                {/if}
            </p>
        </div>
    </div>
</Card.Base>

<style lang="scss">
    .outcome {
        display: flex;
        flex-direction: column;
    }

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
        padding: 2.5rem 1.75rem 0.5rem;
        background: radial-gradient(
            120% 100% at 50% 0%,
            var(--bgcolor-neutral-secondary) 0%,
            transparent 70%
        );
    }

    /* Same identity row as the consent card, now resolved: the dashed "pending"
       connector becomes a solid line with a status node when approved; stays
       dashed with an X when the request was cancelled. */
    .identity {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: var(--border-radius-l, 0.85rem);
        object-fit: cover;
        flex-shrink: 0;
        border: 1px solid var(--border-neutral-strong);
        background: var(--bgcolor-neutral-primary);
    }

    .avatar.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bgcolor-neutral-secondary);
        color: var(--fgcolor-neutral-secondary);
        font-size: 1.25rem;
        font-weight: 600;
    }

    .avatar.account {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bgcolor-neutral-invert);
        color: var(--fgcolor-neutral-on-invert, var(--bgcolor-neutral-primary));
        font-size: 1.1rem;
        font-weight: 600;
    }

    .connector {
        display: flex;
        align-items: center;
        margin-inline: 0.35rem;
    }

    .connector-line {
        width: 1.1rem;
        height: 0;
        border-top: 2px dashed var(--border-neutral-strong);
    }

    .connector-node {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 50%;
        border: 1px solid var(--border-neutral);
        background: var(--bgcolor-neutral-primary);
        color: var(--fgcolor-neutral-secondary);
    }

    .approved .connector-line {
        border-top-style: solid;
        border-top-color: var(--border-success, rgba(16, 185, 129, 0.45));
    }

    .approved .connector-node {
        border-color: var(--border-success, rgba(16, 185, 129, 0.45));
        background: var(--bgcolor-success-weaker, rgba(16, 185, 129, 0.12));
        color: var(--fgcolor-success);
        animation: node-pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.4) both;
    }

    @keyframes node-pop {
        from {
            transform: scale(0.5);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .approved .connector-node {
            animation: none;
        }
    }

    .headline {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        max-width: 22rem;
    }

    .body {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        padding: 1.25rem 1.75rem 1.75rem;
    }

    .close-hint {
        margin: 0;
        text-align: center;
        font-size: 0.78rem;
        color: var(--fgcolor-neutral-tertiary);
    }

    .footnote {
        margin: 0.25rem 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        font-size: 0.78rem;
        color: var(--fgcolor-neutral-tertiary);
        text-align: center;
    }
</style>
