<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import { IconCheck, IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { ACCOUNT_ADMIN_SCOPE, describeConsentScopes } from '$lib/helpers/oauth2-scopes';

    export type OAuth2Flow = 'authorization' | 'device';

    // Identity scopes are self-explanatory from their title, so we render them as
    // single lines. Everything else (full account access, custom scopes) keeps its
    // description so the user understands what they're granting.
    const CONCISE_SCOPES = new Set(['openid', 'profile', 'email']);

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
    const accountInitial = $derived((accountLabel || '?').charAt(0).toUpperCase());

    function showDescription(scopeId: string): boolean {
        return scopeId === ACCOUNT_ADMIN_SCOPE || !CONCISE_SCOPES.has(scopeId);
    }

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
                <Typography.Text variant="m-400" align="center" color="--fgcolor-neutral-secondary">
                    {app.tagline || `${app.name} is requesting access to your Appwrite account.`}
                </Typography.Text>
            </Layout.Stack>

            {#if accountLabel}
                <div class="account-chip">
                    <span class="account-avatar">{accountInitial}</span>
                    <span class="account-label">{accountLabel}</span>
                </div>
            {/if}
        </Layout.Stack>

        <ul class="scope-list">
            {#each scopes as scope (scope.id)}
                <li class="scope-item" class:lead={scope.id === ACCOUNT_ADMIN_SCOPE}>
                    <span class="scope-icon">
                        <Icon icon={scope.icon} size="s" />
                    </span>
                    <span class="scope-text">
                        <span class="scope-title">{scope.title}</span>
                        {#if showDescription(scope.id)}
                            <span class="scope-desc">{scope.description}</span>
                        {/if}
                    </span>
                </li>
            {/each}
        </ul>

        {#if details.length > 0}
            <Layout.Stack gap="s">
                <Typography.Text variant="m-500" color="--fgcolor-neutral-secondary">
                    Also requested
                </Typography.Text>
                <div class="detail-list">
                    {#each details as detail, i (`${detail.type}-${i}`)}
                        <span class="detail-tag">{detail.type}</span>
                    {/each}
                </div>
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

        <p class="footnote">
            {#if flow === 'authorization' && redirectHost}
                <span>You'll be returned to {redirectHost}</span>
            {/if}
            {#if flow === 'device'}
                <span>After authorizing, return to your device</span>
            {/if}
            {#if app.privacyPolicyUrl}
                <a href={app.privacyPolicyUrl} target="_blank" rel="noreferrer" class="footer-link">
                    Privacy
                </a>
            {/if}
            {#if app.termsUrl}
                <a href={app.termsUrl} target="_blank" rel="noreferrer" class="footer-link">
                    Terms
                </a>
            {/if}
        </p>
    </Layout.Stack>
</Card.Base>

<style lang="scss">
    .app-logo {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 0.85rem;
        object-fit: cover;
        border: 1px solid var(--border-neutral-strong);
    }

    .app-logo-placeholder {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 0.85rem;
        border: 1px solid var(--border-neutral-strong);
        background: var(--bgcolor-neutral-secondary);
        color: var(--fgcolor-neutral-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        font-weight: 600;
    }

    /* Account context, shown right under the heading like Google/GitHub consent. */
    .account-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 100%;
        padding: 0.3rem 0.75rem 0.3rem 0.35rem;
        border: 1px solid var(--border-neutral-strong);
        border-radius: 2rem;
        font-size: 0.8125rem;
        color: var(--fgcolor-neutral-secondary);
    }

    .account-avatar {
        flex-shrink: 0;
        width: 1.4rem;
        height: 1.4rem;
        border-radius: 50%;
        background: var(--bgcolor-neutral-invert);
        color: var(--fgcolor-neutral-on-invert, var(--bgcolor-neutral-primary));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 600;
    }

    .account-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--fgcolor-neutral-primary);
    }

    /* Single grouped container — rows split by hairlines instead of N tiles. */
    .scope-list {
        list-style: none;
        margin: 0;
        padding: 0;
        border: 1px solid var(--border-neutral);
        border-radius: 0.75rem;
        background: var(--bgcolor-neutral-default);
        overflow: hidden;
    }

    .scope-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.85rem 0.9rem;
    }

    .scope-item + .scope-item {
        border-top: 1px solid var(--border-neutral);
    }

    .scope-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 0.05rem;
        color: var(--fgcolor-neutral-tertiary);
    }

    .scope-item.lead .scope-icon {
        color: var(--fgcolor-neutral-secondary);
    }

    .scope-text {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        min-width: 0;
    }

    .scope-title {
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.3;
        color: var(--fgcolor-neutral-primary);
    }

    .scope-item.lead .scope-title {
        font-weight: 600;
    }

    .scope-desc {
        font-size: 0.78rem;
        line-height: 1.4;
        color: var(--fgcolor-neutral-secondary);
    }

    /* Rich authorization details — de-emphasized, compact tags. */
    .detail-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    .detail-tag {
        font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 0.74rem;
        color: var(--fgcolor-neutral-secondary);
        border: 1px solid var(--border-neutral-strong);
        border-radius: 0.4rem;
        padding: 0.2rem 0.5rem;
        background: var(--bgcolor-neutral-default);
    }

    .error-box {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        border: 1px solid var(--border-danger, rgba(220, 38, 38, 0.2));
        background: var(--bgcolor-danger-secondary, rgba(220, 38, 38, 0.1));
        border-radius: 0.5rem;
        padding: 0.75rem;
    }

    /* One quiet line: contextual note + legal links, dot-separated. */
    .footnote {
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: var(--fgcolor-neutral-tertiary);
        text-align: center;
    }

    .footnote > :global(* + *)::before {
        content: '·';
        margin-inline-end: 0.5rem;
        color: var(--fgcolor-neutral-tertiary);
    }

    .footer-link {
        color: inherit;
        text-decoration: none;
    }

    .footer-link:hover {
        text-decoration: underline;
    }
</style>
