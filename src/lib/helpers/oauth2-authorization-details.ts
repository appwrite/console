import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getTeamOrOrganizationList } from '$lib/stores/organization';

/**
 * RFC 9396 Rich Authorization Requests (RAR) helpers for the OAuth2 consent
 * screen.
 *
 * The console OAuth2 server keeps identity + account/console-tier scopes on the
 * standard `scope` parameter (`openid`, `profile`, `email`, `account.admin`,
 * plus `teams.*`, `projects.*`, …) and moves every project-tier permission into
 * `authorization_details` entries of type `appwrite_project`, each bound to the
 * concrete `projectIds` it applies to. The consent screen lets the user approve
 * a *subset* of the requested actions; the approved set is sent back to the
 * approve endpoint and replaces what the client originally requested. We only
 * ever downscope — actions the client did not request are never offered.
 */

/** The single RAR `type` the console OAuth2 server understands. */
export const APPWRITE_PROJECT_RAR_TYPE = 'appwrite_project';

/** The reserved internal project id; never a valid RAR target. */
const RESERVED_CONSOLE_PROJECT = 'console';

/** Fields an `appwrite_project` entry may carry, besides `type`/`actions`. */
const RESOURCE_FIELDS = ['projectIds', 'organizationIds', 'locations'] as const;

export interface AuthorizationDetail {
    type: string;
    actions?: string[];
    projectIds?: string[];
    organizationIds?: string[];
    locations?: string[];
    [key: string]: unknown;
}

export interface ActionDescriptor {
    /** Scope id, e.g. `databases.write`. */
    action: string;
    /** Human title derived from the scope id. */
    title: string;
    /** Catalog description, or a generic fallback. */
    description: string;
    /** Catalog category used for grouping, e.g. `Databases`. */
    category: string;
    deprecated: boolean;
}

export type ActionCatalog = Map<string, Omit<ActionDescriptor, 'action' | 'title'>>;

/**
 * Account-level scopes are not exposed by the project/organization scope
 * endpoints, so we describe them locally. They are few and stable.
 */
const ACCOUNT_SCOPE_CATALOG: ActionCatalog = new Map([
    [
        'account',
        {
            category: 'Account',
            description: 'Manage your account, organizations, sessions, tokens, and billing.',
            deprecated: false
        }
    ],
    [
        'teams.read',
        {
            category: 'Account',
            description: "Read your account's organizations.",
            deprecated: false
        }
    ],
    [
        'teams.write',
        {
            category: 'Account',
            description: "Create, update, and delete your account's organizations and memberships.",
            deprecated: false
        }
    ]
]);

const UNCATEGORIZED = 'Other';

/** Parse the grant's `authorizationDetails` JSON string into entries. */
export function parseAuthorizationDetails(raw: string | null | undefined): AuthorizationDetail[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as AuthorizationDetail[]) : [];
    } catch {
        return [];
    }
}

export function isAppwriteProjectDetail(detail: AuthorizationDetail): boolean {
    return detail.type === APPWRITE_PROJECT_RAR_TYPE;
}

/** Distinct, requested actions for a single `appwrite_project` entry. */
export function actionsOf(detail: AuthorizationDetail): string[] {
    if (!Array.isArray(detail.actions)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const action of detail.actions) {
        if (typeof action === 'string' && action !== '' && !seen.has(action)) {
            seen.add(action);
            out.push(action);
        }
    }
    return out;
}

/** Turn `databases.write` into `Databases write` for a readable title. */
export function titleizeAction(action: string): string {
    const cleaned = action.replace(/[._:-]+/g, ' ').trim();
    if (!cleaned) return action;
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Build the action catalog from the live project + organization scope
 * endpoints, falling back to the local account-scope map. The consent screen
 * always runs for a signed-in console user, so these admin-scoped endpoints are
 * available; if they fail we still describe actions via the fallback + titleize
 * so the screen never breaks.
 */
export async function loadActionCatalog(): Promise<ActionCatalog> {
    const catalog: ActionCatalog = new Map(ACCOUNT_SCOPE_CATALOG);

    const results = await Promise.allSettled([
        sdk.forConsole.console.listProjectScopes(),
        sdk.forConsole.console.listOrganizationScopes()
    ]);

    for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        for (const scope of result.value.scopes) {
            // Project + organization scopes can overlap (e.g. `teams.read`);
            // first writer wins, which keeps the project description.
            if (!catalog.has(scope.$id)) {
                catalog.set(scope.$id, {
                    category: scope.category || UNCATEGORIZED,
                    description: scope.description,
                    deprecated: scope.deprecated
                });
            }
        }
    }

    return catalog;
}

/** Resolve a single action to a descriptor, falling back to a titleized one. */
export function describeAction(action: string, catalog: ActionCatalog): ActionDescriptor {
    const entry = catalog.get(action);
    return {
        action,
        title: titleizeAction(action),
        description: entry?.description ?? `Access to ${action}.`,
        category: entry?.category ?? UNCATEGORIZED,
        deprecated: entry?.deprecated ?? false
    };
}

/**
 * Rebuild the `authorization_details` array from the user's selection, keyed by
 * entry index. Only `appwrite_console` entries are filtered to the selected
 * actions; entries that end up with no actions are dropped, and entries of
 * other types pass through untouched. Returns a JSON string ready for the
 * approve endpoint, or `'[]'` when nothing remains (an empty string would tell
 * the server to keep the originally requested details, which is never what the
 * consent screen wants).
 */
export function serializeGrantedDetails(
    requested: AuthorizationDetail[],
    selectedByIndex: Record<number, Record<string, boolean>>
): string {
    const granted: AuthorizationDetail[] = [];

    requested.forEach((detail, index) => {
        if (!isAppwriteProjectDetail(detail)) {
            granted.push(detail);
            return;
        }

        const requestedActions = actionsOf(detail);
        const selected = selectedByIndex[index] ?? {};
        const keptActions = requestedActions.filter((action) => selected[action]);

        if (keptActions.length === 0) {
            return;
        }

        const rebuilt: AuthorizationDetail = {
            type: APPWRITE_PROJECT_RAR_TYPE,
            actions: keptActions
        };
        for (const field of RESOURCE_FIELDS) {
            const value = detail[field];
            if (Array.isArray(value) && value.length > 0) {
                rebuilt[field] = value as string[];
            }
        }
        granted.push(rebuilt);
    });

    return JSON.stringify(granted);
}

export interface ResolvedProject {
    id: string;
    /** Project name, or the raw id when it couldn't be resolved. */
    name: string;
    region?: string;
    /** True when a real project name was found; false means we fell back to id. */
    resolved: boolean;
}

export type ProjectNameMap = Map<string, ResolvedProject>;

/** Unique, real project ids referenced across all appwrite_project entries. */
export function collectProjectIds(details: AuthorizationDetail[]): string[] {
    const seen = new Set<string>();
    for (const detail of details) {
        if (!isAppwriteProjectDetail(detail)) continue;
        for (const id of detail.projectIds ?? []) {
            if (typeof id === 'string' && id !== '' && id !== RESERVED_CONSOLE_PROJECT) {
                seen.add(id);
            }
        }
    }
    return [...seen];
}

/**
 * Best-effort resolution of project ids to their display names. A bare project
 * id can't be fetched directly — projects are reachable only through their
 * owning organization — so we list the user's organizations and ask each for
 * the requested ids. Anything we can't find (not owned, or in a non-primary
 * region the console endpoint doesn't see) falls back to showing the raw id.
 * Never throws: on any failure the caller still gets an id-only map.
 */
export async function resolveProjectNames(ids: string[]): Promise<ProjectNameMap> {
    const map: ProjectNameMap = new Map();
    for (const id of ids) {
        map.set(id, { id, name: id, resolved: false });
    }
    if (ids.length === 0) return map;

    try {
        const orgs = await getTeamOrOrganizationList([Query.limit(100)]);
        const results = await Promise.allSettled(
            orgs.teams.map((org) =>
                sdk.forConsole.organization(org.$id).listProjects({
                    queries: [
                        Query.equal('$id', ids),
                        Query.select(['$id', 'name', 'region', 'teamId']),
                        Query.limit(ids.length)
                    ]
                })
            )
        );

        for (const result of results) {
            if (result.status !== 'fulfilled') continue;
            for (const project of result.value.projects) {
                map.set(project.$id, {
                    id: project.$id,
                    name: project.name,
                    region: project.region,
                    resolved: true
                });
            }
        }
    } catch {
        // Keep the id-only fallback map.
    }

    return map;
}
