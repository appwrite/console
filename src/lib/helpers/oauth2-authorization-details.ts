import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getTeamOrOrganizationList } from '$lib/stores/organization';

/**
 * RFC 9396 Rich Authorization Requests (RAR) helpers for the console OAuth2
 * consent screen (contract v2).
 *
 * In v2 the `scope` parameter carries every privilege the client requests (see
 * `oauth2-scopes.ts`). `authorization_details` only binds those privileges to
 * concrete resources, as entries of two types:
 *
 *   { "type": "project",      "identifiers": ["<projectId>", …] | ["*"] }
 *   { "type": "organization", "identifiers": ["<teamId>", …]    | ["*"] }
 *
 * `identifiers` is the only field besides `type`; `*` is a wildcard that binds
 * the tier's scopes to every project / organization the user owns (present and
 * future). The consent screen lets the user narrow the requested identifiers to
 * a subset and sends the result back to the approve endpoint, which replaces the
 * client's requested details.
 */

export const PROJECT_RAR_TYPE = 'project';
export const ORGANIZATION_RAR_TYPE = 'organization';

/** Wildcard identifier — binds a tier's scopes to every owned resource. */
export const WILDCARD_IDENTIFIER = '*';

/** The reserved internal project id; never a valid RAR target. */
const RESERVED_CONSOLE_PROJECT = 'console';

export interface AuthorizationDetail {
    type: string;
    identifiers?: string[];
    [key: string]: unknown;
}

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

/** Distinct, non-empty identifiers for a single entry. */
export function identifiersOf(detail: AuthorizationDetail): string[] {
    if (!Array.isArray(detail.identifiers)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const identifier of detail.identifiers) {
        if (typeof identifier === 'string' && identifier !== '' && !seen.has(identifier)) {
            seen.add(identifier);
            out.push(identifier);
        }
    }
    return out;
}

/**
 * Union of identifiers across every entry of the given type, request order
 * preserved. Keeps the `*` wildcard; drops the reserved `console` project id
 * from `project` entries (the server rejects it anyway).
 */
export function mergeIdentifiers(details: AuthorizationDetail[], type: string): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const detail of details) {
        if (detail.type !== type) continue;
        for (const identifier of identifiersOf(detail)) {
            if (type === PROJECT_RAR_TYPE && identifier === RESERVED_CONSOLE_PROJECT) continue;
            if (seen.has(identifier)) continue;
            seen.add(identifier);
            out.push(identifier);
        }
    }
    return out;
}

export function hasWildcard(identifiers: string[]): boolean {
    return identifiers.includes(WILDCARD_IDENTIFIER);
}

/** Concrete (non-wildcard) ids among a set of identifiers. */
export function concreteIdentifiers(identifiers: string[]): string[] {
    return identifiers.filter((identifier) => identifier !== WILDCARD_IDENTIFIER);
}

/**
 * Rebuild the `authorization_details` array from the user's granted selection.
 * Emits a `project` / `organization` entry only when that tier ends up bound to
 * at least one identifier. Returns a JSON string ready for the approve endpoint,
 * or `'[]'` when nothing remains (an empty string would tell the server to keep
 * the originally requested details, which is never what the consent screen
 * wants).
 */
export function serializeGrantedDetails(granted: {
    project?: string[];
    organization?: string[];
}): string {
    const out: AuthorizationDetail[] = [];
    if (granted.project && granted.project.length > 0) {
        out.push({ type: PROJECT_RAR_TYPE, identifiers: granted.project });
    }
    if (granted.organization && granted.organization.length > 0) {
        out.push({ type: ORGANIZATION_RAR_TYPE, identifiers: granted.organization });
    }
    return JSON.stringify(out);
}

/* -------------------------------------------------------------------------- */
/*  Resource name resolution — turn identifiers into display names            */
/* -------------------------------------------------------------------------- */

export interface ResolvedResource {
    id: string;
    /** Display name, or the raw id when it couldn't be resolved. */
    name: string;
    region?: string;
    /** True when a real name was found; false means we fell back to the id. */
    resolved: boolean;
}

export type ResourceNameMap = Map<string, ResolvedResource>;

export interface ResourcePage {
    resources: ResolvedResource[];
    hasMore: boolean;
}

function idOnlyMap(ids: string[]): ResourceNameMap {
    const map: ResourceNameMap = new Map();
    for (const id of ids) {
        map.set(id, { id, name: id, resolved: false });
    }
    return map;
}

/**
 * Best-effort resolution of project ids to their display names. A bare project
 * id can't be fetched directly — projects are reachable only through their
 * owning organization — so we list the user's organizations and ask each for
 * the requested ids. Anything we can't find (not owned, or in a non-primary
 * region the console endpoint doesn't see) falls back to showing the raw id.
 * Never throws: on any failure the caller still gets an id-only map.
 */
export async function resolveProjectNames(ids: string[]): Promise<ResourceNameMap> {
    const map = idOnlyMap(ids);
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

/**
 * Best-effort resolution of organization ids to their names. The user's
 * organization list already carries names, so a single list call covers it.
 * Never throws: on any failure the caller still gets an id-only map.
 */
export async function resolveOrganizationNames(ids: string[]): Promise<ResourceNameMap> {
    const map = idOnlyMap(ids);
    if (ids.length === 0) return map;

    try {
        const orgs = await getTeamOrOrganizationList([Query.limit(100)]);
        for (const org of orgs.teams) {
            if (map.has(org.$id)) {
                map.set(org.$id, { id: org.$id, name: org.name, resolved: true });
            }
        }
    } catch {
        // Keep the id-only fallback map.
    }

    return map;
}

/* -------------------------------------------------------------------------- */
/*  Type-to-search — narrowing a wildcard grant to specific resources         */
/* -------------------------------------------------------------------------- */

/** Cap on organizations swept per project search, to bound the request fan-out. */
const SEARCH_ORG_SCAN = 20;

/**
 * Search the user's projects by name for the resource picker. Projects are only
 * reachable through their owning organization, so we sweep the user's orgs and
 * ask each for name matches. Results are exposed as a global paginated list
 * across those organizations so the picker can load more as the user scrolls.
 * Never throws: returns an empty page on failure.
 */
export async function searchProjects(
    term: string,
    offset: number,
    limit: number
): Promise<ResourcePage> {
    try {
        const orgs = await getTeamOrOrganizationList([Query.limit(SEARCH_ORG_SCAN)]);
        const trimmed = term.trim();
        const resources: ResolvedResource[] = [];
        let skip = offset;

        for (const org of orgs.teams) {
            const pageLimit = limit + 1 - resources.length;
            const queries = [
                Query.notEqual('$id', RESERVED_CONSOLE_PROJECT),
                Query.offset(skip),
                Query.limit(pageLimit),
                Query.select(['$id', 'name', 'region', 'teamId'])
            ];
            if (trimmed !== '') {
                queries.unshift(Query.startsWith('name', trimmed));
            }

            const result = await sdk.forConsole
                .organization(org.$id)
                .listProjects({ queries })
                .catch(() => null);
            if (!result) continue;

            if (skip >= result.total) {
                skip -= result.total;
                continue;
            }
            skip = 0;

            for (const project of result.projects) {
                resources.push({
                    id: project.$id,
                    name: project.name,
                    region: project.region,
                    resolved: true
                });
            }
            if (resources.length > limit) break;
        }

        return {
            resources: resources.slice(0, limit),
            hasMore: resources.length > limit
        };
    } catch {
        return { resources: [], hasMore: false };
    }
}

/**
 * Search the user's organizations by name using offset pagination. Never
 * throws: returns an empty page on failure.
 */
export async function searchOrganizations(
    term: string,
    offset: number,
    limit: number
): Promise<ResourcePage> {
    try {
        const queries = [Query.offset(offset), Query.limit(limit)];
        const trimmed = term.trim();
        if (trimmed !== '') queries.push(Query.search('name', trimmed));

        const orgs = await getTeamOrOrganizationList(queries);
        return {
            resources: orgs.teams.map((org) => ({
                id: org.$id,
                name: org.name,
                resolved: true
            })),
            hasMore: offset + orgs.teams.length < orgs.total
        };
    } catch {
        return { resources: [], hasMore: false };
    }
}
