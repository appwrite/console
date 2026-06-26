<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import {
        Badge,
        Card,
        Layout,
        Typography,
        Icon,
        Selector,
        Spinner
    } from '@appwrite.io/pink-svelte';
    import { IconCheck, IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { splitSelectableScopes } from '$lib/helpers/oauth2-scopes';
    import {
        actionsOf,
        collectProjectIds,
        isAppwriteProjectDetail,
        loadActionCatalog,
        parseAuthorizationDetails,
        resolveProjectNames,
        serializeGrantedDetails,
        type ActionCatalog,
        type AuthorizationDetail,
        type ResolvedProject
    } from '$lib/helpers/oauth2-authorization-details';
    import OAuth2ScopePicker from './oauth2-scope-picker.svelte';

    export type OAuth2Flow = 'authorization' | 'device';

    /** How many project chips to show in an entry header before collapsing. */
    const MAX_PROJECT_CHIPS = 5;

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

    // The `scope` param carries identity + account/console-tier scopes. Identity
    // and full-access (`account.admin`) are shown read-only; the rest are
    // individually selectable. Project-tier permissions live in
    // authorization_details and are chosen per project below.
    const scopes = $derived(splitSelectableScopes(grant.scopes ?? []));
    const details = $derived<AuthorizationDetail[]>(
        parseAuthorizationDetails(grant.authorizationDetails)
    );
    const hasProjectActions = $derived(
        details.some((detail) => isAppwriteProjectDetail(detail) && actionsOf(detail).length > 0)
    );
    const redirectHost = $derived(hostnameOf(grant.redirectUri));

    const appInitial = $derived((app.name || '?').charAt(0).toUpperCase());
    const accountInitial = $derived((accountLabel || '?').charAt(0).toUpperCase());

    // Lazily loaded scope metadata (category + descriptions) for the per-project
    // pickers. Never blocks approve/reject — the picker shows a spinner until it
    // resolves.
    let catalog = $state<ActionCatalog | null>(null);
    $effect(() => {
        if (!hasProjectActions || catalog) return;
        let cancelled = false;
        void loadActionCatalog().then((loaded) => {
            if (!cancelled) catalog = loaded;
        });
        return () => {
            cancelled = true;
        };
    });

    // Selectable console-scope state: scopeId -> granted. Starts all-on (opt-out).
    // Re-initialised whenever the grant changes so a stale selection can't leak.
    let scopeSelection = $state<Record<string, boolean>>({});
    $effect(() => {
        grant.$id;
        const next: Record<string, boolean> = {};
        for (const descriptor of scopes.selectable) {
            next[descriptor.id] = true;
        }
        scopeSelection = next;
    });

    // Per-entry project-action selection: entryIndex -> { action -> granted }.
    let selection = $state<Record<number, Record<string, boolean>>>({});
    $effect(() => {
        grant.$id;
        const next: Record<number, Record<string, boolean>> = {};
        details.forEach((detail, index) => {
            if (!isAppwriteProjectDetail(detail)) return;
            const actionMap: Record<string, boolean> = {};
            for (const action of actionsOf(detail)) {
                actionMap[action] = true;
            }
            next[index] = actionMap;
        });
        selection = next;
    });

    // Best-effort id -> project resolution. Fills in asynchronously; until then
    // (and for anything unresolved) headers fall back to the raw project id.
    let projectNames = $state<Record<string, ResolvedProject>>({});
    $effect(() => {
        grant.$id;
        const ids = collectProjectIds(details);
        if (ids.length === 0) {
            projectNames = {};
            return;
        }
        let cancelled = false;
        void resolveProjectNames(ids).then((map) => {
            if (!cancelled) projectNames = Object.fromEntries(map);
        });
        return () => {
            cancelled = true;
        };
    });

    function projectsForDetail(detail: AuthorizationDetail): ResolvedProject[] {
        return (detail.projectIds ?? [])
            .filter((id): id is string => typeof id === 'string' && id !== '')
            .map((id) => projectNames[id] ?? { id, name: id, resolved: false });
    }

    const grantedActionCount = $derived(
        Object.values(selection).reduce(
            (total, actionMap) => total + Object.values(actionMap).filter(Boolean).length,
            0
        )
    );
    const grantedConsoleScopeCount = $derived(
        scopes.selectable.filter((descriptor) => scopeSelection[descriptor.id]).length
    );
    // Authorize stays enabled as long as SOMETHING is granted — a project action,
    // a console scope, an identity scope, or full access.
    const nothingToGrant = $derived(
        grantedActionCount === 0 &&
            grantedConsoleScopeCount === 0 &&
            scopes.identity.length === 0 &&
            !scopes.admin &&
            !(grant.scopes ?? []).includes('openid')
    );

    /** The downscoped `scope` string the user consented to (identity always kept). */
    function buildGrantedScope(): string {
        const requested = grant.scopes ?? [];
        const granted: string[] = [];
        const add = (scope: string) => {
            if (!granted.includes(scope)) granted.push(scope);
        };
        if (requested.includes('openid')) add('openid');
        for (const descriptor of scopes.identity) add(descriptor.id);
        if (scopes.admin) add(scopes.admin.id);
        for (const descriptor of scopes.selectable) {
            if (scopeSelection[descriptor.id]) add(descriptor.id);
        }
        return granted.join(' ');
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
            // Send back exactly what the user consented to (downscope-only): the
            // selected console scopes via `scope`, and the selected project
            // actions via `authorization_details` (when any were requested).
            const result = await sdk.forConsole.oauth2.approve({
                grantId,
                scope: buildGrantedScope(),
                authorizationDetails: hasProjectActions
                    ? serializeGrantedDetails(details, selection)
                    : undefined
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
                            <span class="scope-desc">{scope.description}</span>
                        </span>
                    </li>
                {/each}
            </ul>
        {/if}

        {#if scopes.selectable.length > 0}
            <Layout.Stack gap="s">
                <Typography.Text variant="m-500">Console access</Typography.Text>
                <ul class="scope-list">
                    {#each scopes.selectable as scope (scope.id)}
                        <li class="scope-item">
                            <span class="scope-check">
                                <Selector.Checkbox
                                    size="s"
                                    id={`scope-${scope.id}`}
                                    disabled={busy || !!scopes.admin}
                                    bind:checked={scopeSelection[scope.id]} />
                            </span>
                            <label class="scope-text" for={`scope-${scope.id}`}>
                                <span class="scope-title">{scope.title}</span>
                                <span class="scope-desc">{scope.description}</span>
                            </label>
                        </li>
                    {/each}
                </ul>
                {#if scopes.admin}
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                        Full access is granted, so these are included.
                    </Typography.Text>
                {/if}
            </Layout.Stack>
        {/if}

        {#if details.length > 0}
            <Layout.Stack gap="m">
                <Layout.Stack gap="xxs">
                    <Typography.Text variant="m-500">Project access</Typography.Text>
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                        {app.name} requested access to these projects. Grant only the permissions you're
                        comfortable with — you can turn any of them off.
                    </Typography.Text>
                </Layout.Stack>

                {#each details as detail, index (`${detail.type}-${index}`)}
                    {#if isAppwriteProjectDetail(detail) && actionsOf(detail).length > 0}
                        {@const projects = projectsForDetail(detail)}
                        <div class="detail-section">
                            {#if projects.length > 0}
                                <div class="project-header">
                                    {#each projects.slice(0, MAX_PROJECT_CHIPS) as project (project.id)}
                                        <span class="project-chip">
                                            <span
                                                class="project-name"
                                                class:mono={!project.resolved}>
                                                {project.name}
                                            </span>
                                            {#if project.region}
                                                <Badge
                                                    size="xs"
                                                    variant="secondary"
                                                    content={project.region} />
                                            {/if}
                                        </span>
                                    {/each}
                                    {#if projects.length > MAX_PROJECT_CHIPS}
                                        <span class="project-more">
                                            +{projects.length - MAX_PROJECT_CHIPS} more
                                        </span>
                                    {/if}
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

    .scope-icon,
    .scope-check {
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

    label.scope-text {
        cursor: pointer;
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

    /* Project name(s) this entry's permissions apply to. */
    .project-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem 0.6rem;
        margin-bottom: 0.85rem;
    }

    .project-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-width: 0;
    }

    .project-name {
        font-size: 0.85rem;
        font-weight: 500;
        line-height: 1.3;
        color: var(--fgcolor-neutral-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .project-name.mono {
        font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 0.78rem;
        font-weight: 400;
        color: var(--fgcolor-neutral-secondary);
    }

    .project-more {
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
