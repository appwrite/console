<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Accordion, Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import { IconCheck, IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { groupConsentScopes } from '$lib/helpers/oauth2-scopes';
    import {
        actionsOf,
        isAppwriteConsoleDetail,
        loadActionCatalog,
        parseAuthorizationDetails,
        serializeGrantedDetails,
        type ActionCatalog,
        type AuthorizationDetail
    } from '$lib/helpers/oauth2-authorization-details';
    import OAuth2ScopePicker from './oauth2-scope-picker.svelte';

    export type OAuth2Flow = 'authorization' | 'device';

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

    // Requested scopes (identity + account/console-tier) are shown read-only,
    // grouped by resource. The granular per-project permissions live in
    // authorization_details and are chosen individually below.
    const scopes = $derived(groupConsentScopes(grant.scopes ?? []));
    const details = $derived<AuthorizationDetail[]>(
        parseAuthorizationDetails(grant.authorizationDetails)
    );
    const hasConsoleActions = $derived(
        details.some((detail) => isAppwriteConsoleDetail(detail) && actionsOf(detail).length > 0)
    );
    const redirectHost = $derived(hostnameOf(grant.redirectUri));

    const appInitial = $derived((app.name || '?').charAt(0).toUpperCase());
    const accountInitial = $derived((accountLabel || '?').charAt(0).toUpperCase());

    // Lazily loaded scope metadata (category + descriptions) for grouping the
    // requested actions. Never blocks approve/reject — the picker just shows a
    // spinner until it resolves.
    let catalog = $state<ActionCatalog | null>(null);
    $effect(() => {
        if (!hasConsoleActions || catalog) return;
        let cancelled = false;
        void loadActionCatalog().then((loaded) => {
            if (!cancelled) catalog = loaded;
        });
        return () => {
            cancelled = true;
        };
    });

    // Per-entry action selection: entryIndex -> { action -> granted }. Requested
    // actions start selected (the user opts OUT of what they don't want). Reset
    // whenever the grant changes so a stale selection can't leak across requests.
    let selection = $state<Record<number, Record<string, boolean>>>({});
    $effect(() => {
        // Re-init keyed on the grant id + its requested details.
        grant.$id;
        const next: Record<number, Record<string, boolean>> = {};
        details.forEach((detail, index) => {
            if (!isAppwriteConsoleDetail(detail)) return;
            const actionMap: Record<string, boolean> = {};
            for (const action of actionsOf(detail)) {
                actionMap[action] = true;
            }
            next[index] = actionMap;
        });
        selection = next;
    });

    /** A short, human context line for an entry's resource scoping. */
    function detailContext(detail: AuthorizationDetail): string | null {
        const parts: string[] = [];
        const projects = detail.projectIds?.length ?? 0;
        const orgs = detail.organizationIds?.length ?? 0;
        if (projects > 0) parts.push(`${projects} project${projects === 1 ? '' : 's'}`);
        if (orgs > 0) parts.push(`${orgs} organization${orgs === 1 ? '' : 's'}`);
        if (parts.length === 0) return null;
        return `Limited to ${parts.join(' and ')}`;
    }

    function locationHosts(detail: AuthorizationDetail): string[] {
        return (detail.locations ?? [])
            .map((location) => hostnameOf(location))
            .filter((host): host is string => Boolean(host));
    }

    // Approving is meaningless if the request offered actions but the user
    // unchecked every one and granted no identity scope either.
    const grantedActionCount = $derived(
        Object.values(selection).reduce(
            (total, actionMap) =>
                total + Object.values(actionMap).filter((isGranted) => isGranted).length,
            0
        )
    );
    const nothingToGrant = $derived(
        hasConsoleActions && grantedActionCount === 0 && (grant.scopes ?? []).length === 0
    );

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
            // When the request carries appwrite_console actions, send back the
            // exact subset the user consented to (downscope-only — the picker
            // never offers actions the client didn't request). Otherwise omit
            // it and keep whatever the client originally requested.
            const authorizationDetails = hasConsoleActions
                ? serializeGrantedDetails(details, selection)
                : undefined;
            const result = await sdk.forConsole.oauth2.approve({
                grantId,
                authorizationDetails
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

        {#if scopes.admin || scopes.identity.length > 0}
            <ul class="scope-list">
                {#if scopes.admin}
                    <li class="scope-item lead">
                        <span class="scope-icon">
                            <Icon icon={scopes.admin.icon} size="s" />
                        </span>
                        <span class="scope-text">
                            <span class="scope-title">{scopes.admin.title}</span>
                            <span class="scope-desc">{scopes.admin.description}</span>
                        </span>
                    </li>
                {/if}
                {#each scopes.identity as scope (scope.id)}
                    <li class="scope-item">
                        <span class="scope-icon">
                            <Icon icon={scope.icon} size="s" />
                        </span>
                        <span class="scope-text">
                            <span class="scope-title">{scope.title}</span>
                        </span>
                    </li>
                {/each}
            </ul>
        {/if}

        {#if scopes.groups.length > 0}
            <div class="scope-accordion">
                <Accordion title="Account access" badge={String(scopes.granularCount)}>
                    <ul class="scope-group-list">
                        {#each scopes.groups as group (group.resource)}
                            <li class="scope-group">
                                <span class="scope-icon">
                                    <Icon icon={group.icon} size="s" />
                                </span>
                                <span class="scope-group-title">{group.title}</span>
                                <span class="scope-group-actions">
                                    {#each group.actions as action (action.id)}
                                        <span class="scope-action-tag">{action.label}</span>
                                    {/each}
                                </span>
                            </li>
                        {/each}
                    </ul>
                </Accordion>
            </div>
        {/if}

        {#if details.length > 0}
            <Layout.Stack gap="m">
                <Layout.Stack gap="xxs">
                    <Typography.Text variant="m-500">Choose what to allow</Typography.Text>
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                        {app.name} requested these permissions. Grant only the ones you're comfortable
                        with — you can turn any of them off.
                    </Typography.Text>
                </Layout.Stack>

                {#each details as detail, index (`${detail.type}-${index}`)}
                    {#if isAppwriteConsoleDetail(detail) && actionsOf(detail).length > 0}
                        {@const context = detailContext(detail)}
                        {@const hosts = locationHosts(detail)}
                        <div class="detail-section">
                            {#if context || hosts.length > 0}
                                <div class="detail-context">
                                    {#if context}<span>{context}</span>{/if}
                                    {#if hosts.length > 0}<span>{hosts.join(', ')}</span>{/if}
                                </div>
                            {/if}
                            {#if catalog}
                                <OAuth2ScopePicker
                                    actions={actionsOf(detail)}
                                    {catalog}
                                    disabled={busy}
                                    bind:selected={selection[index]} />
                            {:else}
                                <div class="picker-loading">
                                    <Spinner size="m" />
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <!-- Unknown RAR type: surface it read-only so the user
                             still sees it, but it isn't user-editable here. -->
                        <div class="detail-list">
                            <span class="detail-tag">{detail.type}</span>
                        </div>
                    {/if}
                {/each}
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
                <Button fullWidth submit disabled={busy || nothingToGrant}>
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

    /* Collapsed bucket of granular console scopes, grouped by resource. */
    .scope-accordion {
        border: 1px solid var(--border-neutral);
        border-radius: 0.75rem;
        overflow: hidden;
    }

    .scope-group-list {
        list-style: none;
        margin: 0;
        padding-block-start: 0.25rem;
        padding-inline-end: 0.25rem;
    }

    .scope-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.8rem 0;
    }

    .scope-group + .scope-group {
        border-top: 1px solid var(--border-neutral);
    }

    .scope-group-title {
        flex: 1;
        min-width: 0;
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.3;
        color: var(--fgcolor-neutral-primary);
    }

    .scope-group-actions {
        display: flex;
        flex-shrink: 0;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.3rem;
    }

    .scope-action-tag {
        font-size: 0.72rem;
        line-height: 1.4;
        color: var(--fgcolor-neutral-secondary);
        border: 1px solid var(--border-neutral-strong);
        border-radius: 0.4rem;
        padding: 0.1rem 0.4rem;
        background: var(--bgcolor-neutral-default);
    }

    /* Rich authorization details — one bordered picker section per requested entry. */
    .detail-section {
        border: 1px solid var(--border-neutral);
        border-radius: 0.75rem;
        background: var(--bgcolor-neutral-default);
        padding: 0.9rem;
    }

    .detail-section + .detail-section {
        margin-top: 0.5rem;
    }

    .detail-context {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem 0.75rem;
        margin-bottom: 0.75rem;
        font-size: 0.78rem;
        color: var(--fgcolor-neutral-tertiary);
    }

    .picker-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem 0;
    }

    /* Unknown RAR types fall back to de-emphasized, compact tags. */
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
