<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { AppwriteException, type Models } from '@appwrite.io/console';
    import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import { IconDesktopComputer } from '@appwrite.io/pink-icons-svelte';
    import { Button, Form, Label } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import OAuth2ConsentCard, { type OAuth2Flow, type OAuth2Outcome } from '../consent-card.svelte';
    import OAuth2OutcomeCard from '../outcome-card.svelte';

    type Phase = 'loading' | 'enter-code' | 'consent' | 'approved' | 'denied';

    const DEVICE_FLOW: OAuth2Flow = 'device';

    /** Keep only the characters the device user codes are built from. */
    function normalizeUserCode(value: string): string {
        return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    let phase = $state<Phase>('loading');
    let account = $state<Models.User<Models.Preferences> | null>(null);
    let code = $state(normalizeUserCode(page.url.searchParams.get('user_code') ?? ''));
    let grant = $state<Models.Oauth2Grant | null>(null);
    let app = $state<Models.App | null>(null);
    let error = $state<string | null>(null);
    let submitting = $state(false);
    let hasPrefilledCode = $state(
        Boolean(normalizeUserCode(page.url.searchParams.get('user_code') ?? ''))
    );

    onMount(() => {
        let cancelled = false;

        async function init() {
            const loggedInAccount = (await sdk.forConsole.account
                .get()
                .catch(() => null)) as Models.User<Models.Preferences> | null;
            if (cancelled) return;

            if (!loggedInAccount) {
                void goto(
                    `${base}/login?redirect=${encodeURIComponent(
                        window.location.pathname + window.location.search
                    )}`,
                    { replaceState: true }
                );
                return;
            }

            account = loggedInAccount;
            // Always show the code (prefilled from the URL or typed) so the user
            // can confirm it matches their device before exchanging it — never
            // auto-submit.
            phase = 'enter-code';
        }

        void init();
        return () => {
            cancelled = true;
        };
    });

    // Sync state to the `user_code` in the URL. This tracks ONLY the URL param
    // (not the locally-typed `code`), so typing in the field never re-triggers
    // it. Whenever the URL code changes — including being removed — the previous
    // request is no longer valid, so drop any loaded grant and return to
    // confirmation rather than confirming/approving a stale one.
    let lastUrlCode = $state<string | null>(null);
    $effect(() => {
        const urlCode = normalizeUserCode(page.url.searchParams.get('user_code') ?? '');
        if (urlCode === lastUrlCode) return;
        lastUrlCode = urlCode;
        code = urlCode;
        grant = null;
        app = null;
        error = null;
        hasPrefilledCode = Boolean(urlCode);
        if (phase !== 'loading') phase = 'enter-code';
    });

    async function handleSubmit() {
        // Guard against a double Enter / programmatic resubmit racing or
        // invalidating the in-flight request.
        if (submitting) return;
        const normalized = normalizeUserCode(code);
        if (!normalized) return;
        error = null;
        submitting = true;
        try {
            const loadedGrant = await sdk.forConsole.oauth2.createGrant({
                userCode: normalized
            });
            const loadedApp = await sdk.forConsole.apps.get({
                appId: loadedGrant.appId
            });
            // A fresh `user_code` may have arrived while we awaited. Ignore this
            // now-stale result so we never show consent for a superseded request.
            if (normalizeUserCode(code) !== normalized) return;
            trackEvent(Submit.AccountOAuth2DeviceVerify, {
                app_id: loadedGrant.appId
            });
            grant = loadedGrant;
            app = loadedApp;
            error = null;
            phase = 'consent';
        } catch (e: unknown) {
            // Drop errors from a submission the active code has already moved past.
            if (normalizeUserCode(code) !== normalized) return;
            if (e instanceof AppwriteException && e.type === 'oauth2_invalid_user_code') {
                error = 'That code is invalid or has expired. Check your device and try again.';
            } else {
                error = (e as Error)?.message ?? 'Could not verify that code.';
                addNotification({ type: 'error', message: error });
                trackError(e as Error, Submit.AccountOAuth2DeviceVerify);
            }
            phase = 'enter-code';
        } finally {
            submitting = false;
        }
    }

    function onDone(outcome: OAuth2Outcome) {
        phase = outcome === 'approved' ? 'approved' : 'denied';
    }
</script>

<svelte:head>
    <title>Connect a device - Appwrite</title>
</svelte:head>

<div class="device-page">
    <div class="device-card-wrapper">
        {#if phase === 'loading'}
            <div class="spinner-wrap">
                <Spinner size="l" />
            </div>
        {:else if phase === 'enter-code'}
            <Card.Base padding="l" radius="l" style="width: 100%;">
                <Form onSubmit={handleSubmit}>
                    <Layout.Stack gap="xl">
                        <Layout.Stack gap="l" alignItems="center" alignContent="center">
                            <div class="header-icon-wrap">
                                <Icon icon={IconDesktopComputer} size="l" />
                            </div>
                            <Layout.Stack gap="xs" alignItems="center" alignContent="center">
                                <Typography.Title size="m" align="center">
                                    {hasPrefilledCode ? 'Confirm your code' : 'Connect a device'}
                                </Typography.Title>
                                <Typography.Text variant="m-400" align="center">
                                    {hasPrefilledCode
                                        ? 'Make sure this matches the code shown on your device, then continue.'
                                        : 'Enter the code shown on your device to continue.'}
                                </Typography.Text>
                            </Layout.Stack>
                        </Layout.Stack>

                        <Layout.Stack gap="s">
                            <Label for="user-code">Device code</Label>
                            <input
                                id="user-code"
                                type="text"
                                value={code}
                                oninput={(e) => {
                                    code = normalizeUserCode(e.currentTarget.value);
                                    error = null;
                                }}
                                placeholder="XXXXXXXX"
                                autofocus
                                autocomplete="off"
                                autocapitalize="characters"
                                spellcheck="false"
                                maxlength={12}
                                disabled={submitting}
                                class="code-input" />
                            {#if error}
                                <Typography.Text variant="m-400" color="--fgcolor-danger">
                                    {error}
                                </Typography.Text>
                            {/if}
                        </Layout.Stack>

                        <Button fullWidth submit disabled={code.length === 0 || submitting}>
                            {submitting ? 'Verifying…' : 'Continue'}
                        </Button>

                        {#if account}
                            <Typography.Text
                                variant="m-400"
                                align="center"
                                color="--fgcolor-neutral-secondary">
                                Signed in as
                                <span class="bold">{account.email || account.name}</span>.
                            </Typography.Text>
                        {/if}
                    </Layout.Stack>
                </Form>
            </Card.Base>
        {:else if phase === 'consent' && grant && app}
            <OAuth2ConsentCard
                {grant}
                {app}
                accountLabel={account?.email || account?.name || undefined}
                flow={DEVICE_FLOW}
                {onDone} />
        {:else if phase === 'approved' || phase === 'denied'}
            <OAuth2OutcomeCard
                outcome={phase}
                flow={DEVICE_FLOW}
                {app}
                accountLabel={account?.email || account?.name || undefined} />
        {/if}
    </div>
</div>

<style lang="scss">
    .device-page {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .device-card-wrapper {
        width: 100%;
        max-width: 28rem;
    }

    .spinner-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 16rem;
    }

    .header-icon-wrap {
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
        background: var(--bgcolor-neutral-secondary, #f4f4f4);
        color: var(--fgcolor-neutral-secondary, #6b7280);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .code-input {
        width: 100%;
        text-align: center;
        font-family: var(
            --font-family-mono,
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace
        );
        font-size: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        padding: 0.625rem 0.75rem;
        border: 1px solid var(--border-color-neutral-strong, #d0d0d0);
        border-radius: 0.5rem;
        background: var(--bgcolor-neutral-primary, #fff);
        color: var(--fgcolor-neutral-primary, #1f2937);
        outline: none;
    }

    .code-input:focus {
        border-color: var(--border-color-focus, #2563eb);
    }

    .code-input:disabled {
        opacity: 0.6;
    }

    .bold {
        font-weight: 500;
    }
</style>
