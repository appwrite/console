<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import {
        IconCheck,
        IconExclamation,
        IconShieldCheck,
        IconExternalLink
    } from '@appwrite.io/pink-icons-svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { describeConsentScopes } from '$lib/helpers/oauth2-scopes';

    export type OAuth2Flow = 'authorization' | 'device';

    interface AuthorizationDetail {
        type: string;
        [key: string]: unknown;
    }

    function parseAuthorizationDetails(raw: string): AuthorizationDetail[] {
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as AuthorizationDetail[]) : [];
        } catch {
            return [];
        }
    }

    function hostnameOf(uri: string): string | null {
        try {
            return new URL(uri).hostname;
        } catch {
            return null;
        }
    }

    interface Props {
        grant: Models.Oauth2Grant;
        app: Models.App;
        accountLabel?: string;
        flow: OAuth2Flow;
        onDeviceDone?: (outcome: 'approved' | 'denied') => void;
    }

    let { grant, app, accountLabel = undefined, flow, onDeviceDone }: Props = $props();

    let error = $state<string | null>(null);
    let approving = $state(false);
    let rejecting = $state(false);
    let busy = $derived(approving || rejecting);

    const scopes = $derived(describeConsentScopes(grant.scopes ?? []));
    const details = $derived(parseAuthorizationDetails(grant.authorizationDetails ?? ''));
    const redirectHost = $derived(hostnameOf(grant.redirectUri));

    const appInitial = $derived((app.name || '?').charAt(0).toUpperCase());

    async function approve() {
        if (busy) return;
        // Pin the request we're acting on. If the parent swaps in a different
        // grant while this call is in flight (the route moved to another
        // consent request), drop the stale result so we never redirect with the
        // previous grant's redirectUrl.
        const grantId = grant.$id;
        error = null;
        approving = true;
        try {
            const result = await sdk.forConsole.oauth2.approve({
                grantId
            });
            if (grant.$id !== grantId) return;
            trackEvent(Submit.AccountOAuth2ConsentApprove, {
                app_id: grant.appId,
                flow
            });
            if (flow === 'device' || !result.redirectUrl) {
                onDeviceDone?.('approved');
                return;
            }
            window.location.href = result.redirectUrl;
        } catch (e: unknown) {
            if (grant.$id !== grantId) return;
            const message = (e as Error)?.message ?? 'Failed to authorize the application';
            error = message;
            addNotification({ type: 'error', message });
            trackError(e as Error, Submit.AccountOAuth2ConsentApprove);
        } finally {
            approving = false;
        }
    }

    async function reject() {
        if (busy) return;
        // Pin the request we're acting on (see `approve`).
        const grantId = grant.$id;
        error = null;
        rejecting = true;
        try {
            const result = await sdk.forConsole.oauth2.reject({
                grantId
            });
            if (grant.$id !== grantId) return;
            trackEvent(Submit.AccountOAuth2ConsentDeny, {
                app_id: grant.appId,
                flow
            });
            if (flow === 'device' || !result.redirectUrl) {
                onDeviceDone?.('denied');
                return;
            }
            window.location.href = result.redirectUrl;
        } catch (e: unknown) {
            if (grant.$id !== grantId) return;
            const message = (e as Error)?.message ?? 'Failed to cancel the request';
            error = message;
            addNotification({ type: 'error', message });
            trackError(e as Error, Submit.AccountOAuth2ConsentDeny);
        } finally {
            rejecting = false;
        }
    }
</script>

<Card.Base padding="l" radius="l" style="width: 100%;">
    <Layout.Stack gap="xl">
        <Layout.Stack gap="l" alignItems="center" alignContent="center">
            {#if app.logoUri}
                <img src={app.logoUri} alt={app.name} class="app-logo" />
            {:else}
                <div class="app-logo-placeholder">
                    {appInitial}
                </div>
            {/if}
            <Layout.Stack gap="xs" alignItems="center" alignContent="center">
                <Typography.Title size="m" align="center">
                    Authorize {app.name}
                </Typography.Title>
                <Typography.Text variant="m-400" align="center">
                    {app.tagline || `${app.name} wants to access your Appwrite account.`}
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>

        <Layout.Stack gap="m">
            <Typography.Eyebrow color="--fgcolor-neutral-secondary">
                This will allow {app.name} to
            </Typography.Eyebrow>
            <ul class="scope-list">
                {#each scopes as scope (scope.id)}
                    <li class="scope-item">
                        <span class="scope-icon">
                            <Icon icon={scope.icon} size="s" />
                        </span>
                        <span class="scope-text">
                            <span class="scope-title">{scope.title}</span>
                            <span class="scope-desc">{scope.description}</span>
                        </span>
                    </li>
                {/each}
            </ul>
        </Layout.Stack>

        {#if details.length > 0}
            <Layout.Stack gap="s">
                <Typography.Eyebrow color="--fgcolor-neutral-secondary">
                    Requested resources
                </Typography.Eyebrow>
                <ul class="detail-list">
                    {#each details as detail, i (`${detail.type}-${i}`)}
                        <li class="detail-item">
                            <Icon
                                icon={IconShieldCheck}
                                size="s"
                                color="--fgcolor-neutral-secondary" />
                            <span class="detail-type">{detail.type}</span>
                        </li>
                    {/each}
                </ul>
            </Layout.Stack>
        {/if}

        {#if error}
            <div class="error-box">
                <Icon icon={IconExclamation} size="s" color="--fgcolor-danger" />
                <Typography.Text variant="m-400" color="--fgcolor-danger">
                    {error}
                </Typography.Text>
            </div>
        {/if}

        <Form onSubmit={approve}>
            <Layout.Stack gap="s">
                <Button fullWidth submit disabled={busy}>
                    {#if approving}
                        <Spinner size="s" />
                    {:else}
                        <Icon icon={IconCheck} slot="start" size="s" />
                    {/if}
                    {approving ? 'Authorizing…' : 'Authorize'}
                </Button>
                <Button fullWidth secondary disabled={busy} on:click={reject}>
                    {rejecting ? 'Cancelling…' : 'Cancel'}
                </Button>
            </Layout.Stack>
        </Form>

        <Typography.Text variant="m-400" align="center" color="--fgcolor-neutral-secondary">
            {#if accountLabel}
                Signed in as <span class="bold">{accountLabel}</span>.{' '}
            {/if}
            {#if flow === 'authorization' && redirectHost}
                You'll be redirected to {redirectHost}.
            {/if}
            {#if flow === 'device'}
                After authorizing, return to your device.
            {/if}
        </Typography.Text>

        {#if app.privacyPolicyUrl || app.termsUrl}
            <Typography.Text variant="m-400" align="center" color="--fgcolor-neutral-secondary">
                {#if app.privacyPolicyUrl}
                    <a
                        href={app.privacyPolicyUrl}
                        target="_blank"
                        rel="noreferrer"
                        class="footer-link">
                        Privacy Policy
                        <Icon icon={IconExternalLink} size="xs" />
                    </a>
                {/if}
                {#if app.privacyPolicyUrl && app.termsUrl}
                    {' · '}
                {/if}
                {#if app.termsUrl}
                    <a href={app.termsUrl} target="_blank" rel="noreferrer" class="footer-link">
                        Terms of Service
                        <Icon icon={IconExternalLink} size="xs" />
                    </a>
                {/if}
            </Typography.Text>
        {/if}
    </Layout.Stack>
</Card.Base>

<style lang="scss">
    .app-logo {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 0.75rem;
        object-fit: cover;
        border: 1px solid var(--border-color-neutral-strong, #e2e2e2);
    }

    .app-logo-placeholder {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 0.75rem;
        border: 1px solid var(--border-color-neutral-strong, #e2e2e2);
        background: var(--bgcolor-neutral-secondary, #f4f4f4);
        color: var(--fgcolor-neutral-secondary, #6b7280);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .scope-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .scope-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .scope-icon {
        flex-shrink: 0;
        width: 2rem;
        height: 2rem;
        border-radius: 0.5rem;
        background: var(--bgcolor-neutral-secondary, #f4f4f4);
        color: var(--fgcolor-neutral-secondary, #6b7280);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 0.125rem;
    }

    .scope-text {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }

    .scope-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--fgcolor-neutral-primary, #1f2937);
    }

    .scope-desc {
        font-size: 0.75rem;
        color: var(--fgcolor-neutral-secondary, #6b7280);
    }

    .detail-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
    }

    .detail-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--bgcolor-neutral-secondary, #f4f4f4);
        border-radius: 0.5rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .detail-type {
        color: var(--fgcolor-neutral-primary, #1f2937);
    }

    .error-box {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        border: 1px solid var(--border-color-danger, rgba(220, 38, 38, 0.2));
        background: var(--bgcolor-danger-secondary, rgba(220, 38, 38, 0.1));
        border-radius: 0.375rem;
        padding: 0.75rem;
    }

    .bold {
        font-weight: 500;
    }

    .footer-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        color: inherit;
        text-decoration: none;
    }

    .footer-link:hover {
        text-decoration: underline;
    }
</style>
