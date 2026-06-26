import { sdk } from '$lib/stores/sdk';

/**
 * RFC 9396 Rich Authorization Requests (RAR) helpers for the OAuth2 consent
 * screen.
 *
 * The console OAuth2 server keeps a small set of identity scopes on the
 * standard `scope` parameter (`openid`, `profile`, `email`, `account.admin`)
 * and moves every granular permission into `authorization_details` entries of
 * type `appwrite_console`. The consent screen lets the user approve a *subset*
 * of the requested actions; the approved set is sent back to the approve
 * endpoint and replaces what the client originally requested. We only ever
 * downscope — actions the client did not request are never offered.
 */

/** The single RAR `type` the console OAuth2 server understands. */
export const APPWRITE_CONSOLE_RAR_TYPE = 'appwrite_console';

/** Fields an `appwrite_console` entry may carry, besides `type`/`actions`. */
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

export function isAppwriteConsoleDetail(detail: AuthorizationDetail): boolean {
    return detail.type === APPWRITE_CONSOLE_RAR_TYPE;
}

/** Distinct, requested actions for a single `appwrite_console` entry. */
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
        if (!isAppwriteConsoleDetail(detail)) {
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
            type: APPWRITE_CONSOLE_RAR_TYPE,
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
