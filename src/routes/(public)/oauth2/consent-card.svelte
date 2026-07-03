<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import {
        IconCheck,
        IconExclamation,
        IconChevronDown,
        IconChevronUp,
        IconLink,
        IconFolder,
        IconOfficeBuilding,
        IconLockClosed,
        IconExclamationCircle,
        IconDuplicate,
        IconAdjustments,
        IconShieldCheck
    } from '@appwrite.io/pink-icons-svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        splitConsentScopes,
        buildConsentPermissions,
        buildTierEditorRows,
        PROJECT_SCOPE_PREFIX,
        ORGANIZATION_SCOPE_PREFIX,
        type EditorRow
    } from '$lib/helpers/oauth2-scopes';
    import {
        isMcpGrant,
        composeGrantedScopes,
        type TierSelection,
        type ResourceSelection
    } from '$lib/helpers/oauth2-mcp';
    import {
        parseAuthorizationDetails,
        mergeIdentifiers,
        serializeGrantedDetails,
        searchProjects,
        listOrganizationResources,
        resolveProjectNames,
        resolveOrganizationNames,
        PROJECT_RAR_TYPE,
        ORGANIZATION_RAR_TYPE,
        WILDCARD_IDENTIFIER,
        type ResolvedResource,
        type ResourceNameMap
    } from '$lib/helpers/oauth2-authorization-details';
    import ResourceSelector from './resource-selector.svelte';

    export type OAuth2Flow = 'authorization' | 'device';

    function hostnameOf(uri: string): string | null {
        try {
            return new URL(uri).hostname;
        } catch {
            return null;
        }
    }

    // Scope tokens are never rendered inline — they add noise. Instead each row
    // exposes a hover copy button that yields the raw token, exactly as issued
    // (prefix included), for anyone who needs the precise string.
    let copiedToken = $state<string | null>(null);
    let copyTimer: ReturnType<typeof setTimeout> | null = null;
    async function copyToken(token: string) {
        try {
            await navigator.clipboard.writeText(token);
            copiedToken = token;
            if (copyTimer) clearTimeout(copyTimer);
            copyTimer = setTimeout(() => (copiedToken = null), 1500);
        } catch {
            /* clipboard unavailable — nothing to surface */
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

    // The `scope` param carries every requested privilege. Scopes are shown
    // read-only — the client decides what it asks for. authorization_details
    // binds the project/organization tiers to concrete resources, and that
    // binding is the only thing the user narrows here.
    const scopeModel = $derived(splitConsentScopes(grant.scopes ?? []));
    const details = $derived(parseAuthorizationDetails(grant.authorizationDetails));

    const projectScopesRequested = $derived(
        scopeModel.project.all || scopeModel.project.scopes.length > 0
    );
    const organizationScopesRequested = $derived(
        scopeModel.organization.all || scopeModel.organization.scopes.length > 0
    );

    // When a tier's scopes are requested but left unbound, fall back to the
    // wildcard so the user still gets the full resource picker.
    const projectIdentifiers = $derived.by(() => {
        const bound = mergeIdentifiers(details, PROJECT_RAR_TYPE);
        if (bound.length > 0) return bound;
        return projectScopesRequested ? [WILDCARD_IDENTIFIER] : [];
    });
    const organizationIdentifiers = $derived.by(() => {
        const bound = mergeIdentifiers(details, ORGANIZATION_RAR_TYPE);
        if (bound.length > 0) return bound;
        return organizationScopesRequested ? [WILDCARD_IDENTIFIER] : [];
    });

    const projectRequested = $derived(projectScopesRequested && projectIdentifiers.length > 0);
    const organizationRequested = $derived(
        organizationScopesRequested && organizationIdentifiers.length > 0
    );

    const redirectHost = $derived(hostnameOf(grant.redirectUri));
    const appInitial = $derived((app.name || '?').charAt(0).toUpperCase());
    const accountInitial = $derived((accountLabel || '?').charAt(0).toUpperCase());

    const permissionGroups = $derived(buildConsentPermissions(scopeModel));
    let showPermissions = $state(true);

    // MCP grants (detected via the grant's RFC 8707 resources) get a narrowing
    // editor: the client requested the full scope catalog, so consent is the
    // control point. Every other grant renders exactly as before — read-only
    // permissions, no scope narrowing.
    const canNarrow = $derived(isMcpGrant(grant));

    // The one thing the user controls: which projects / organizations the tiers
    // are bound to. Defaults to exactly what the client requested; reset on grant
    // change so a stale selection can't leak.
    let projectSelected = $state<string[]>([]);
    let organizationSelected = $state<string[]>([]);

    // Scope-narrowing editor state (MCP grants only). Rows absent from a tier's
    // selection are selected with full requested access, so the empty record is
    // the "full access" default.
    let customize = $state(false);
    let readOnlyAll = $state(false);
    let projectSelection = $state<TierSelection>({});
    let organizationSelection = $state<TierSelection>({});

    $effect(() => {
        grant.$id;
        projectSelected = [...projectIdentifiers];
        organizationSelected = [...organizationIdentifiers];
        customize = false;
        readOnlyAll = false;
        projectSelection = {};
        organizationSelection = {};
    });

    const projectRows = $derived(
        canNarrow ? buildTierEditorRows(scopeModel.project, PROJECT_SCOPE_PREFIX) : []
    );
    const organizationRows = $derived(
        canNarrow ? buildTierEditorRows(scopeModel.organization, ORGANIZATION_SCOPE_PREFIX) : []
    );

    function sameIdentifiers(a: string[], b: string[]): boolean {
        return a.length === b.length && a.every((id) => b.includes(id));
    }
    const resourcesNarrowed = $derived(
        !sameIdentifiers(projectSelected, projectIdentifiers) ||
            !sameIdentifiers(organizationSelected, organizationIdentifiers)
    );

    // The narrowed grant to send on approve. `scope: undefined` means the user
    // kept the full request — the approve call then omits `scope` so the server
    // grants the full literal requested list and re-authorizations skip consent.
    const composed = $derived(
        canNarrow
            ? composeGrantedScopes({
                  model: scopeModel,
                  project: projectSelection,
                  organization: organizationSelection,
                  readOnly: readOnlyAll,
                  resourcesNarrowed
              })
            : null
    );

    function rowState(selection: TierSelection, resource: string): ResourceSelection {
        return selection[resource] ?? { selected: true, level: 'full' };
    }

    function updateRow(
        tier: 'project' | 'organization',
        resource: string,
        patch: Partial<ResourceSelection>
    ) {
        const selection = tier === 'project' ? projectSelection : organizationSelection;
        const next = { ...selection, [resource]: { ...rowState(selection, resource), ...patch } };
        if (tier === 'project') projectSelection = next;
        else organizationSelection = next;
    }

    function setAllRows(tier: 'project' | 'organization', rows: EditorRow[], selected: boolean) {
        const next: TierSelection = {};
        for (const row of rows) next[row.resource] = { selected, level: 'full' };
        if (tier === 'project') projectSelection = next;
        else organizationSelection = next;
    }

    function tierAllSelected(rows: EditorRow[], selection: TierSelection): boolean {
        return rows.every((row) => rowState(selection, row.resource).selected);
    }

    const projectGranted = $derived(projectRequested && projectSelected.length > 0);
    const organizationGranted = $derived(organizationRequested && organizationSelected.length > 0);

    // A requested tier must be bound to at least one resource, otherwise its
    // scopes are inert — the app would be "authorized" yet unable to act. Block
    // Authorize until every requested tier has a selection.
    const projectNeedsResource = $derived(projectRequested && projectSelected.length === 0);
    const organizationNeedsResource = $derived(
        organizationRequested && organizationSelected.length === 0
    );

    // Authorize stays enabled while SOMETHING is granted and no requested tier is
    // left without a resource.
    const nothingToGrant = $derived(
        scopeModel.identity.length === 0 &&
            !scopeModel.all &&
            !projectGranted &&
            !organizationGranted
    );
    // With the narrowing editor, the selection must keep at least one
    // non-identity scope — an identity-only grant would leave the app
    // "authorized" but unable to act.
    const nothingSelected = $derived(composed?.blocked ?? false);
    const blocked = $derived(
        nothingToGrant || projectNeedsResource || organizationNeedsResource || nothingSelected
    );

    // Resource search wiring. Projects search server-side (there can be many);
    // organizations are few, so they load once and filter client-side.
    function findProjects(term: string): Promise<ResolvedResource[]> {
        return searchProjects(term);
    }
    let orgCache: ResolvedResource[] | null = null;
    async function findOrganizations(term: string): Promise<ResolvedResource[]> {
        if (!orgCache) orgCache = await listOrganizationResources();
        const t = term.trim().toLowerCase();
        const list = t ? orgCache.filter((o) => o.name.toLowerCase().includes(t)) : orgCache;
        return list.slice(0, 8);
    }
    function resolveProjects(ids: string[]): Promise<ResourceNameMap> {
        return resolveProjectNames(ids);
    }
    function resolveOrganizations(ids: string[]): Promise<ResourceNameMap> {
        return resolveOrganizationNames(ids);
    }

    const summary = $derived.by(() => {
        const parts: string[] = [];
        if (scopeModel.identity.length > 0) parts.push('view your identity');
        if (scopeModel.all) parts.push('fully manage your Appwrite account');
        if (projectRequested) parts.push('access the projects you choose');
        if (organizationRequested) parts.push('manage the organizations you choose');
        if (parts.length === 0) return `${app.name} is requesting access to your Appwrite account.`;
        const joined =
            parts.length === 1
                ? parts[0]
                : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
        return `This will allow ${app.name} to ${joined}.`;
    });

    async function approve() {
        if (busy) return;
        // Pin the request we're acting on so a mid-flight grant swap can't redirect
        // with the wrong grant's redirectUrl.
        const grantId = grant.$id;
        error = null;
        approving = true;
        try {
            const result = await sdk.forConsole.oauth2.approve({
                grantId,
                // For MCP grants the editor may downscope the requested catalog;
                // `scope` stays omitted when the user kept the full request so
                // the server grants the full literal requested list (keeping the
                // consent-skip diff empty on re-authorization). Non-MCP grants
                // never send `scope` — only the resource binding is narrowed.
                scope: composed?.scope,
                authorizationDetails:
                    projectRequested || organizationRequested
                        ? serializeGrantedDetails({
                              project: projectGranted ? projectSelected : undefined,
                              organization: organizationGranted ? organizationSelected : undefined
                          })
                        : undefined
            });
            if (grant.$id !== grantId) return;
            trackEvent(Submit.AccountOAuth2ConsentApprove, { app_id: grant.appId, flow });
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
        const grantId = grant.$id;
        error = null;
        rejecting = true;
        try {
            const result = await sdk.forConsole.oauth2.reject({ grantId });
            if (grant.$id !== grantId) return;
            trackEvent(Submit.AccountOAuth2ConsentDeny, { app_id: grant.appId, flow });
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

{#snippet editorGroup(
    tierKey: 'project' | 'organization',
    heading: string,
    note: string,
    rows: EditorRow[],
    selection: TierSelection
)}
    {#if rows.length > 0}
        <div class="perm-group">
            <div class="perm-group-head">
                <label class="editor-check group-check">
                    <input
                        type="checkbox"
                        checked={tierAllSelected(rows, selection)}
                        onchange={(e) => setAllRows(tierKey, rows, e.currentTarget.checked)}
                        disabled={busy} />
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-secondary">
                        {heading}
                    </Typography.Text>
                </label>
                <span class="subtext">{note}</span>
            </div>
            <ul class="perm-list">
                {#each rows as row (row.resource)}
                    {@const state = rowState(selection, row.resource)}
                    <li class="perm editor-row" class:off={!state.selected}>
                        <label class="editor-check">
                            <input
                                type="checkbox"
                                checked={state.selected}
                                onchange={(e) =>
                                    updateRow(tierKey, row.resource, {
                                        selected: e.currentTarget.checked
                                    })}
                                disabled={busy}
                                aria-label="Allow access to {row.title}" />
                        </label>
                        <span class="perm-text">
                            <span class="perm-row-head">
                                <span class="perm-title">{row.title}</span>
                                {#if row.hasRead && row.hasWrite}
                                    <span class="level-toggle" class:disabled={!state.selected}>
                                        <button
                                            type="button"
                                            class="level-btn"
                                            class:active={state.level === 'read' || readOnlyAll}
                                            disabled={busy || !state.selected}
                                            onclick={() =>
                                                updateRow(tierKey, row.resource, {
                                                    level: 'read'
                                                })}>
                                            Read
                                        </button>
                                        <button
                                            type="button"
                                            class="level-btn"
                                            class:active={state.level === 'full' && !readOnlyAll}
                                            disabled={busy || !state.selected || readOnlyAll}
                                            onclick={() =>
                                                updateRow(tierKey, row.resource, {
                                                    level: 'full'
                                                })}>
                                            Read + Write
                                        </button>
                                    </span>
                                {:else}
                                    <span class="access-chip" class:strong={row.accessStrong}>
                                        {row.access}
                                    </span>
                                {/if}
                            </span>
                            {#if row.description}
                                <span class="perm-desc">{row.description}</span>
                            {/if}
                        </span>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
{/snippet}

{#snippet copyBtn(token: string)}
    <button
        type="button"
        class="copy-btn"
        class:copied={copiedToken === token}
        title="Copy scope"
        aria-label="Copy scope {token}"
        onclick={() => copyToken(token)}>
        <Icon icon={copiedToken === token ? IconCheck : IconDuplicate} size="s" />
    </button>
{/snippet}

<Card.Base padding="none" radius="l" style="width: 100%; overflow: hidden;">
    <div class="consent">
        <header class="header">
            <div class="identity">
                {#if app.logoUri}
                    <img src={app.logoUri} alt={app.name} class="avatar" />
                {:else}
                    <div class="avatar placeholder">{appInitial}</div>
                {/if}
                {#if accountLabel}
                    <span class="connector">
                        <span class="connector-line"></span>
                        <span class="connector-node">
                            <Icon icon={IconLink} size="s" />
                        </span>
                        <span class="connector-line"></span>
                    </span>
                    <div class="avatar account">{accountInitial}</div>
                {/if}
            </div>

            <div class="headline">
                <Typography.Title size="m" align="center">
                    Authorize {app.name}
                </Typography.Title>
                <Typography.Text variant="m-400" align="center" color="--fgcolor-neutral-secondary">
                    {summary}
                </Typography.Text>
            </div>

            {#if accountLabel}
                <div class="account-chip">
                    <span class="account-avatar">{accountInitial}</span>
                    <span class="account-label">{accountLabel}</span>
                </div>
            {/if}
        </header>

        <div class="body">
            {#if canNarrow}
                <section class="panel editor-panel">
                    <div class="access-summary">
                        <span class="scope-icon">
                            <Icon icon={IconShieldCheck} size="s" />
                        </span>
                        <span class="scope-head-text">
                            <Typography.Text variant="m-500">
                                {composed?.untouched ? 'Full access' : 'Custom access'}
                            </Typography.Text>
                            <span class="subtext">
                                {composed?.untouched
                                    ? `${app.name} will be able to manage your organizations, projects, and their data on your behalf.`
                                    : `${app.name} only gets the permissions you selected below.`}
                            </span>
                        </span>
                    </div>

                    <button
                        type="button"
                        class="customize-head"
                        aria-expanded={customize}
                        onclick={() => (customize = !customize)}>
                        <span class="customize-label">
                            <span class="customize-icon">
                                <Icon icon={IconAdjustments} size="s" />
                            </span>
                            <span class="scope-head-text">
                                <span class="perm-title">Customize access</span>
                                <span class="subtext"
                                    >You can limit {app.name} to specific projects and actions.</span>
                            </span>
                        </span>
                        <Icon icon={customize ? IconChevronUp : IconChevronDown} size="s" />
                    </button>

                    {#if customize}
                        <div class="editor-body">
                            <label class="editor-readonly">
                                <input type="checkbox" bind:checked={readOnlyAll} disabled={busy} />
                                <span class="perm-text">
                                    <span class="perm-title">Read-only</span>
                                    <span class="subtext"
                                        >Limit every selected permission to viewing data — nothing
                                        can be created, changed, or deleted.</span>
                                </span>
                            </label>

                            {#if scopeModel.identity.length > 0}
                                <span class="subtext editor-identity">
                                    Basic identity ({scopeModel.identity
                                        .map((scope) => scope.id)
                                        .join(', ')}) is always shared so {app.name} can recognize your
                                    account.
                                </span>
                            {/if}

                            {@render editorGroup(
                                'project',
                                'Projects',
                                'Applies only to the projects you select below.',
                                projectRows,
                                projectSelection
                            )}
                            {@render editorGroup(
                                'organization',
                                'Organizations',
                                'Applies only to the organizations you select below.',
                                organizationRows,
                                organizationSelection
                            )}

                            {#if nothingSelected}
                                <div class="scope-warning">
                                    <Icon
                                        icon={IconExclamationCircle}
                                        size="s"
                                        color="--fgcolor-warning" />
                                    <span
                                        >Select at least one permission, or {app.name} gets no access
                                        at all.</span>
                                </div>
                            {/if}
                            {#if composed?.lengthCollapsed}
                                <div class="scope-warning">
                                    <Icon
                                        icon={IconExclamationCircle}
                                        size="s"
                                        color="--fgcolor-warning" />
                                    <span
                                        >Your selection was too long to grant scope-by-scope, so a
                                        fully selected tier was granted as full tier access instead.</span>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </section>
            {:else if permissionGroups.length > 0}
                <section class="panel">
                    <button
                        type="button"
                        class="panel-head"
                        aria-expanded={showPermissions}
                        onclick={() => (showPermissions = !showPermissions)}>
                        <span class="panel-head-label">
                            <Icon icon={IconLockClosed} size="s" />
                            <Typography.Text variant="m-500">Permissions</Typography.Text>
                        </span>
                        <Icon icon={showPermissions ? IconChevronUp : IconChevronDown} size="s" />
                    </button>

                    {#if showPermissions}
                        <div class="panel-body">
                            {#each permissionGroups as group (group.heading)}
                                <div class="perm-group">
                                    <div class="perm-group-head">
                                        <Typography.Text
                                            variant="m-500"
                                            color="--fgcolor-neutral-secondary">
                                            {group.heading}
                                        </Typography.Text>
                                        {#if group.note}
                                            <span class="subtext">{group.note}</span>
                                        {/if}
                                    </div>
                                    <ul class="perm-list">
                                        {#each group.lines as line (line.token)}
                                            <li class="perm">
                                                <span class="perm-check">
                                                    <Icon icon={IconCheck} size="s" />
                                                </span>
                                                <span class="perm-text">
                                                    <span class="perm-row-head">
                                                        <span class="perm-title">{line.title}</span>
                                                        {#if line.access}
                                                            <span
                                                                class="access-chip"
                                                                class:strong={line.accessStrong}
                                                                >{line.access}</span>
                                                        {/if}
                                                    </span>
                                                    {#if line.description}
                                                        <span class="perm-desc"
                                                            >{line.description}</span>
                                                    {/if}
                                                </span>
                                                {@render copyBtn(line.token)}
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </section>
            {/if}

            {#if projectRequested}
                <section class="panel scope-panel" class:needs-attention={projectNeedsResource}>
                    <div class="scope-head">
                        <span class="scope-icon">
                            <Icon icon={IconFolder} size="s" />
                        </span>
                        <span class="scope-head-text">
                            <Typography.Text variant="m-500">Project access</Typography.Text>
                            <span class="subtext"
                                >Choose which projects {app.name} can access.</span>
                        </span>
                    </div>
                    <ResourceSelector
                        pluralLabel="projects"
                        requested={projectIdentifiers}
                        find={findProjects}
                        resolveNames={resolveProjects}
                        disabled={busy}
                        bind:selected={projectSelected} />
                    {#if projectNeedsResource}
                        <div class="scope-warning">
                            <Icon icon={IconExclamationCircle} size="s" color="--fgcolor-warning" />
                            <span
                                >Pick at least one project, or {app.name} gets no project access.</span>
                        </div>
                    {/if}
                </section>
            {/if}

            {#if organizationRequested}
                <section
                    class="panel scope-panel"
                    class:needs-attention={organizationNeedsResource}>
                    <div class="scope-head">
                        <span class="scope-icon">
                            <Icon icon={IconOfficeBuilding} size="s" />
                        </span>
                        <span class="scope-head-text">
                            <Typography.Text variant="m-500">Organization access</Typography.Text>
                            <span class="subtext"
                                >Choose which organizations {app.name} can access.</span>
                        </span>
                    </div>
                    <ResourceSelector
                        pluralLabel="organizations"
                        requested={organizationIdentifiers}
                        find={findOrganizations}
                        resolveNames={resolveOrganizations}
                        disabled={busy}
                        bind:selected={organizationSelected} />
                    {#if organizationNeedsResource}
                        <div class="scope-warning">
                            <Icon icon={IconExclamationCircle} size="s" color="--fgcolor-warning" />
                            <span
                                >Pick at least one organization, or {app.name} gets no organization access.</span>
                        </div>
                    {/if}
                </section>
            {/if}

            {#if error}
                <div class="error-box">
                    <Icon icon={IconExclamation} size="s" color="--fgcolor-danger" />
                    <Typography.Text variant="m-400" color="--fgcolor-danger"
                        >{error}</Typography.Text>
                </div>
            {/if}

            <Form onSubmit={approve}>
                <Layout.Stack gap="s">
                    <Button fullWidth submit disabled={busy || blocked}>
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
                <span class="footnote-secure">
                    <Icon icon={IconLockClosed} size="s" />
                    {#if flow === 'authorization' && redirectHost}
                        <span>You'll be returned to {redirectHost}</span>
                    {:else if flow === 'device'}
                        <span>After authorizing, return to your device</span>
                    {:else}
                        <span>You can revoke access anytime</span>
                    {/if}
                </span>
                {#if app.privacyPolicyUrl}
                    <a
                        href={app.privacyPolicyUrl}
                        target="_blank"
                        rel="noreferrer"
                        class="footer-link">
                        Privacy
                    </a>
                {/if}
                {#if app.termsUrl}
                    <a href={app.termsUrl} target="_blank" rel="noreferrer" class="footer-link">
                        Terms
                    </a>
                {/if}
            </p>
        </div>
    </div>
</Card.Base>

<style lang="scss">
    .consent {
        display: flex;
        flex-direction: column;
    }

    /* ---- Header ------------------------------------------------------------ */
    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2rem 1.75rem 1.5rem;
        background: radial-gradient(
            120% 100% at 50% 0%,
            var(--bgcolor-neutral-secondary) 0%,
            transparent 70%
        );
    }

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

    .headline {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        max-width: 22rem;
    }

    .account-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 100%;
        padding: 0.3rem 0.85rem 0.3rem 0.35rem;
        border: 1px solid var(--border-neutral-strong);
        border-radius: 2rem;
        font-size: 0.8125rem;
        color: var(--fgcolor-neutral-secondary);
        background: var(--bgcolor-neutral-primary);
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

    /* ---- Body -------------------------------------------------------------- */
    .body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem 1.75rem 1.75rem;
    }

    .panel {
        border: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-m, 0.6rem);
        background: var(--bgcolor-neutral-primary);
        overflow: hidden;
    }

    .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.85rem 1rem;
        border: none;
        background: transparent;
        color: var(--fgcolor-neutral-primary);
        cursor: pointer;
    }

    .panel-head:hover {
        background: var(--overlay-neutral-hover, var(--bgcolor-neutral-secondary));
    }

    .panel-head-label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--fgcolor-neutral-secondary);
    }

    .panel-body {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 0.25rem 1rem 1.1rem;
    }

    .perm-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .perm-group-head {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
    }

    .perm-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
    }

    .perm {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 0.7rem;
        padding: 0.7rem 0;
    }

    .perm + .perm {
        border-top: 1px solid var(--border-neutral);
    }

    .perm-check {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        margin-top: 0.05rem;
        border-radius: 50%;
        background: var(--bgcolor-success-weaker, rgba(16, 185, 129, 0.12));
        color: var(--fgcolor-success, var(--fgcolor-neutral-secondary));
    }

    .perm-text {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        min-width: 0;
        flex: 1;
    }

    .perm-row-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        min-height: 1.35rem;
    }

    .access-chip {
        flex-shrink: 0;
        padding: 0.05rem 0.4rem;
        border: 1px solid var(--border-neutral-strong);
        border-radius: 2rem;
        font-size: 0.58rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        white-space: nowrap;
        color: var(--fgcolor-neutral-secondary);
    }

    .access-chip.strong {
        border-color: var(--border-warning-weak, var(--border-warning));
        color: var(--fgcolor-warning);
    }

    .perm-title {
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.3;
        color: var(--fgcolor-neutral-primary);
    }

    .perm-desc {
        padding-right: 2.25rem;
        font-size: 0.78rem;
        line-height: 1.4;
        color: var(--fgcolor-neutral-secondary);
    }

    .copy-btn {
        position: absolute;
        right: 0;
        bottom: 0.55rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        border: none;
        border-radius: var(--border-radius-xs, 0.3rem);
        background: var(--bgcolor-neutral-primary);
        color: var(--fgcolor-neutral-tertiary);
        cursor: pointer;
        opacity: 0;
        transition:
            opacity 0.12s ease,
            background 0.12s ease,
            color 0.12s ease;
    }

    .perm:hover .copy-btn,
    .copy-btn:focus-visible,
    .copy-btn.copied {
        opacity: 1;
    }

    .copy-btn:hover {
        background: var(--overlay-neutral-hover, var(--bgcolor-neutral-secondary));
        color: var(--fgcolor-neutral-primary);
    }

    .copy-btn.copied {
        color: var(--fgcolor-success);
    }

    /* ---- MCP narrowing editor ----------------------------------------------- */
    .editor-panel {
        display: flex;
        flex-direction: column;
    }

    .access-summary {
        display: flex;
        align-items: flex-start;
        gap: 0.7rem;
        padding: 1rem 1rem 0.85rem;
    }

    .customize-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        width: 100%;
        padding: 0.85rem 1rem;
        border: none;
        border-top: 1px solid var(--border-neutral);
        background: transparent;
        color: var(--fgcolor-neutral-primary);
        cursor: pointer;
        text-align: left;
    }

    .customize-head:hover {
        background: var(--overlay-neutral-hover, var(--bgcolor-neutral-secondary));
    }

    .customize-label {
        display: inline-flex;
        align-items: flex-start;
        gap: 0.7rem;
        min-width: 0;
    }

    .customize-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: var(--border-radius-s, 0.5rem);
        background: var(--bgcolor-neutral-secondary);
        color: var(--fgcolor-neutral-secondary);
    }

    .editor-body {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
        padding: 0.9rem 1rem 1.1rem;
        border-top: 1px solid var(--border-neutral);
        max-height: 24rem;
        overflow-y: auto;
    }

    .editor-readonly {
        display: flex;
        align-items: flex-start;
        gap: 0.7rem;
        padding: 0.7rem 0.8rem;
        border: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-s, 0.5rem);
        background: var(--bgcolor-neutral-secondary);
        cursor: pointer;
    }

    .editor-identity {
        display: block;
    }

    .editor-check {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        cursor: pointer;
    }

    .editor-check input[type='checkbox'],
    .editor-readonly input[type='checkbox'] {
        width: 1rem;
        height: 1rem;
        margin: 0.15rem 0 0;
        accent-color: var(--bgcolor-neutral-invert);
        cursor: pointer;
    }

    .editor-row.off .perm-text {
        opacity: 0.45;
    }

    .level-toggle {
        flex-shrink: 0;
        display: inline-flex;
        border: 1px solid var(--border-neutral-strong);
        border-radius: 2rem;
        overflow: hidden;
    }

    .level-toggle.disabled {
        opacity: 0.45;
    }

    .level-btn {
        padding: 0.1rem 0.55rem;
        border: none;
        background: transparent;
        font-size: 0.58rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        white-space: nowrap;
        color: var(--fgcolor-neutral-secondary);
        cursor: pointer;
    }

    .level-btn + .level-btn {
        border-left: 1px solid var(--border-neutral-strong);
    }

    .level-btn.active {
        background: var(--bgcolor-neutral-invert);
        color: var(--fgcolor-neutral-on-invert, var(--bgcolor-neutral-primary));
    }

    .level-btn:disabled {
        cursor: default;
    }

    /* ---- Scope (resource) panels ------------------------------------------ */
    .scope-panel {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 1rem;
        transition: border-color 0.15s ease;
    }

    .scope-panel.needs-attention {
        border-color: var(--border-warning-weak, var(--border-warning));
    }

    .scope-warning {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.55rem 0.7rem;
        border-radius: var(--border-radius-s, 0.5rem);
        background: var(--bgcolor-warning-weaker, rgba(234, 179, 8, 0.12));
        color: var(--fgcolor-warning);
        font-size: 0.78rem;
        line-height: 1.4;
    }

    .scope-head {
        display: flex;
        align-items: flex-start;
        gap: 0.7rem;
    }

    .scope-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: var(--border-radius-s, 0.5rem);
        background: var(--bgcolor-neutral-secondary);
        color: var(--fgcolor-neutral-secondary);
    }

    .scope-head-text {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        min-width: 0;
    }

    .subtext {
        font-size: 0.78rem;
        line-height: 1.4;
        color: var(--fgcolor-neutral-tertiary);
    }

    /* ---- Error / footer ---------------------------------------------------- */
    .error-box {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        border: 1px solid var(--border-danger, rgba(220, 38, 38, 0.2));
        background: var(--bgcolor-danger-secondary, rgba(220, 38, 38, 0.1));
        border-radius: var(--border-radius-s, 0.5rem);
        padding: 0.75rem;
    }

    .footnote {
        margin: 0.25rem 0 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: var(--fgcolor-neutral-tertiary);
        text-align: center;
    }

    .footnote-secure {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
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
        color: var(--fgcolor-neutral-secondary);
    }
</style>
