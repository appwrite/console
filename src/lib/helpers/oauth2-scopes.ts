import type { ComponentType } from 'svelte';
import {
    IconIdentification,
    IconUser,
    IconMail,
    IconDeviceMobile,
    IconShieldCheck,
    IconKey
} from '@appwrite.io/pink-icons-svelte';

/**
 * Scope helpers for the console OAuth2 consent screen (RAR contract v2).
 *
 * The `scope` parameter now carries *every* privilege the client is asking for.
 * `authorization_details` only binds those privileges to concrete resources
 * (see `oauth2-authorization-details.ts`). A requested scope reads as one of:
 *
 *   - an OIDC identity scope: `openid`, `profile`, `email`, `phone`
 *   - `all` — console-wide full access (replaces the old `account.admin`)
 *   - `project:all` / `project:<scope>` — project-tier permissions
 *   - `organization:all` / `organization:<scope>` — organization-tier permissions
 *
 * The consent screen only ever downscopes: it offers the requested scopes and
 * sends back the subset the user consented to.
 */

/** Console-wide full-access scope; grants everything when present. */
export const ALL_SCOPE = 'all';
/** Grants every project-tier scope for the bound projects. */
export const PROJECT_ALL_SCOPE = 'project:all';
/** Grants every organization-tier scope for the bound organizations. */
export const ORGANIZATION_ALL_SCOPE = 'organization:all';
export const PROJECT_SCOPE_PREFIX = 'project:';
export const ORGANIZATION_SCOPE_PREFIX = 'organization:';

/** OIDC identity scopes — always granted, never toggleable, order preserved. */
const IDENTITY_SCOPES = ['openid', 'profile', 'email', 'phone'] as const;

export interface ScopeDescriptor {
    id: string;
    title: string;
    description: string;
    icon: ComponentType;
}

/**
 * Identity + full-access scopes are described locally: they're stable and are
 * not returned by the project/organization scope endpoints. Everything else is
 * a project/organization scope, described from the authored resource catalog below.
 */
const BUILTIN_SCOPES: Record<string, Omit<ScopeDescriptor, 'id'>> = {
    openid: {
        title: 'Verify your identity',
        description: 'Confirm who you are using your Appwrite account.',
        icon: IconIdentification
    },
    profile: {
        title: 'View your profile',
        description: 'Read your name and profile details.',
        icon: IconUser
    },
    email: {
        title: 'View your email address',
        description: "Read your account's email address.",
        icon: IconMail
    },
    phone: {
        title: 'View your phone number',
        description: "Read your account's phone number.",
        icon: IconDeviceMobile
    },
    [ALL_SCOPE]: {
        title: 'Full access to your account',
        description: 'Manage all your organizations, projects, and their resources on your behalf.',
        icon: IconShieldCheck
    }
};

function titleizeScope(scope: string): string {
    const cleaned = scope.replace(/[._:-]+/g, ' ').trim();
    if (!cleaned) return scope;
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function describeScope(scope: string): ScopeDescriptor {
    const builtin = BUILTIN_SCOPES[scope];
    if (builtin) {
        return { id: scope, ...builtin };
    }
    return {
        id: scope,
        title: titleizeScope(scope),
        description: `Access to ${scope}.`,
        icon: IconKey
    };
}

/** Per-tier (project / organization) requested scopes, prefix already stripped. */
export interface TierScopes {
    /** `<tier>:all` was requested — the tier's full-access toggle. */
    all: boolean;
    /** Bare scope ids (prefix stripped, `all` excluded), request order preserved. */
    scopes: string[];
}

export interface ConsentScopeModel {
    /** OIDC identity scopes, read-only, always granted. */
    identity: ScopeDescriptor[];
    /** Console-wide `all` full access, read-only, subsumes everything else. */
    all: ScopeDescriptor | null;
    project: TierScopes;
    organization: TierScopes;
}

function collectTier(scopes: string[], prefix: string, allScope: string): TierScopes {
    const seen = new Set<string>();
    const out: string[] = [];
    let all = false;
    for (const scope of scopes) {
        if (scope === allScope) {
            all = true;
            continue;
        }
        if (!scope.startsWith(prefix)) continue;
        const bare = scope.slice(prefix.length);
        if (bare === '' || seen.has(bare)) continue;
        seen.add(bare);
        out.push(bare);
    }
    return { all, scopes: out };
}

/**
 * Split the requested `scope` values into the shape the consent screen renders:
 * identity (read-only), console-wide `all` (read-only), and the project /
 * organization tiers with their `all` flag and individual scopes.
 */
export function splitConsentScopes(scopes: string[]): ConsentScopeModel {
    const requested = new Set(scopes);
    return {
        identity: IDENTITY_SCOPES.filter((scope) => requested.has(scope)).map(describeScope),
        all: requested.has(ALL_SCOPE) ? describeScope(ALL_SCOPE) : null,
        project: collectTier(scopes, PROJECT_SCOPE_PREFIX, PROJECT_ALL_SCOPE),
        organization: collectTier(scopes, ORGANIZATION_SCOPE_PREFIX, ORGANIZATION_ALL_SCOPE)
    };
}

/* -------------------------------------------------------------------------- */
/*  Resource catalog — console-authored copy for every scope Cloud exposes    */
/* -------------------------------------------------------------------------- */

/**
 * Console-authored copy per resource (the part of a scope before the last dot,
 * e.g. `tables` in `tables.read`). The server's own scope descriptions are terse
 * ("Access to read database tables") and read/write pairs arrive as two lines;
 * this catalog gives each resource a clean title plus a description.
 *
 * The read/write signal lives in the row *title* ("Read Tables" / "Write Tables"
 * / "Read and write Tables"), generated from the requested actions. The
 * description just says what the resource is — `noun` supplies it as a sentence
 * ("database tables and their structure" → "Database tables and their structure.").
 * Provide an explicit `read` / `write` / `both` description only when a noun
 * phrase misses nuance (read-only services, the organization tier's project
 * metadata, execute-style scopes). Resources not listed fall back to a titleized
 * name with no description, so future scopes still render a sensible title.
 */
interface ResourceCopy {
    /** Row title — just the resource name, e.g. "Tables". */
    name: string;
    /** One full-line description of what the resource covers. */
    desc?: string;
}

const PROJECT_RESOURCE_COPY: Record<string, ResourceCopy> = {
    project: {
        name: 'Project settings',
        desc: "This project's general settings, name, and configuration."
    },
    keys: {
        name: 'API keys',
        desc: "API keys that grant server-side access to this project's resources."
    },
    platforms: {
        name: 'Platforms',
        desc: 'The web, mobile, and native app platforms registered with this project.'
    },
    mocks: {
        name: 'Mock numbers',
        desc: 'Mock phone numbers used to test phone authentication flows.'
    },
    'project.policies': {
        name: 'Project policies',
        desc: "This project's security and access policies."
    },
    templates: {
        name: 'Templates',
        desc: "The project's customizable email and SMS message templates."
    },
    stages: {
        name: 'Stages',
        desc: 'Deployment stages used to promote changes across environments.'
    },
    oauth2: {
        name: 'OAuth2',
        desc: "This project's OAuth2 provider configuration and token introspection."
    },
    users: {
        name: 'Users',
        desc: 'End-user accounts, including their profiles, preferences, and identifiers.'
    },
    sessions: {
        name: 'Sessions',
        desc: "Active login sessions belonging to this project's users."
    },
    teams: {
        name: 'Teams',
        desc: 'Teams and their memberships, used to group and organize users.'
    },
    databases: {
        name: 'Databases',
        desc: 'Databases and their overall configuration within this project.'
    },
    tables: {
        name: 'Tables',
        desc: 'Database tables along with their columns, indexes, and structure.'
    },
    columns: {
        name: 'Columns',
        desc: 'The columns that define the structure of your database tables.'
    },
    indexes: {
        name: 'Indexes',
        desc: 'The indexes that speed up queries against your database tables.'
    },
    rows: {
        name: 'Rows',
        desc: 'The individual rows of data stored inside your database tables.'
    },
    buckets: {
        name: 'Storage buckets',
        desc: 'Storage buckets and their file-level permission and security settings.'
    },
    files: {
        name: 'Files',
        desc: 'Files stored in your buckets, including uploads, downloads, and previews.'
    },
    tokens: {
        name: 'File tokens',
        desc: 'Access tokens that grant shareable links to individual storage files.'
    },
    functions: {
        name: 'Functions',
        desc: 'Serverless functions along with their code deployments and configuration.'
    },
    executions: {
        name: 'Executions',
        desc: 'The execution history and logs of your serverless functions.'
    },
    sites: {
        name: 'Sites',
        desc: 'Hosted sites and their deployments, builds, and configuration.'
    },
    log: { name: 'Site logs', desc: 'Runtime and build logs produced by your sites.' },
    providers: {
        name: 'Messaging providers',
        desc: 'Messaging providers used to send email, SMS, and push notifications.'
    },
    topics: {
        name: 'Topics',
        desc: 'Messaging topics that group subscribers for targeted broadcasts.'
    },
    subscribers: {
        name: 'Subscribers',
        desc: 'Subscribers enrolled in your messaging topics.'
    },
    targets: {
        name: 'Targets',
        desc: 'The delivery targets (email, phone, or device) attached to your users.'
    },
    messages: {
        name: 'Messages',
        desc: 'Email, SMS, and push messages, including drafts and delivery status.'
    },
    rules: {
        name: 'Proxy rules',
        desc: "Proxy rules that route custom domains to this project's resources."
    },
    webhooks: {
        name: 'Webhooks',
        desc: 'Webhooks that notify external services when project events occur.'
    },
    locale: {
        name: 'Locale',
        desc: 'The Locale service for reading locale, language, and geo information.'
    },
    avatars: {
        name: 'Avatars',
        desc: 'The Avatars service for generating avatars, icons, flags, and QR codes.'
    },
    health: {
        name: 'Health',
        desc: "The health and operational status of this project's services."
    },
    assistant: {
        name: 'AI Assistant',
        desc: 'The AI Assistant that suggests answers and configuration.'
    },
    migrations: {
        name: 'Migrations',
        desc: 'Data migrations that import from or export to other projects.'
    },
    schedules: {
        name: 'Schedules',
        desc: 'Scheduled tasks that run functions or messages at set times.'
    },
    vcs: {
        name: 'Git',
        desc: 'Connected Git repositories used to deploy functions and sites.'
    },
    insights: {
        name: 'Advisor insights',
        desc: 'Advisor insights that surface recommendations for your project.'
    },
    reports: {
        name: 'Advisor reports',
        desc: "Advisor reports generated from your project's activity."
    },
    presences: {
        name: 'Presence',
        desc: 'Realtime presence data showing which users are currently online.'
    },
    'backups.policies': {
        name: 'Backup policies',
        desc: 'Policies that define when and how your data is backed up.'
    },
    archives: {
        name: 'Backup archives',
        desc: "Backup archives captured from this project's data."
    },
    restorations: {
        name: 'Restorations',
        desc: 'Restore operations that recover data from backup archives.'
    },
    dedicatedDatabases: {
        name: 'Dedicated SQL',
        desc: 'Direct SQL access to run statements against dedicated databases.'
    },
    domains: { name: 'Domains', desc: 'Custom domains connected to this project.' },
    events: {
        name: 'Events',
        desc: 'The realtime and system events emitted by this project.'
    },
    apps: {
        name: 'OAuth2 apps',
        desc: 'OAuth2 applications registered to authorize against this project.'
    },
    usage: {
        name: 'Usage',
        desc: "Usage statistics and metrics for this project's resources."
    }
};

const ORGANIZATION_RESOURCE_COPY: Record<string, ResourceCopy> = {
    projects: {
        name: 'Projects',
        // The organization tier grants org-level management of project metadata,
        // never the data inside any project — spell that out so it can't be misread.
        desc: "The names, IDs, and settings of this organization's projects, but not the data inside them."
    },
    'organization.keys': {
        name: 'Organization keys',
        desc: 'Organization-level API keys that authorize access across projects.'
    },
    domains: {
        name: 'Organization domains',
        desc: 'Custom domains owned and managed at the organization level.'
    }
};

/**
 * Resolve the row for one resource, given which actions (`read` / `write` /
 * `execute` / …) of it were requested. Following Supabase's consent screen, the
 * title is just the resource name and the read/write signal lives in a chip
 * ("READ" / "WRITE" / "READ + WRITE"); the description says what the resource is.
 */
function describeResource(
    resource: string,
    actions: string[],
    copyMap: Record<string, ResourceCopy>
): { title: string; description?: string; access: string; accessStrong: boolean } {
    const copy = copyMap[resource];
    const title = copy?.name ?? titleizeScope(resource);
    const hasRead = actions.includes('read');
    const hasWrite = actions.includes('write');

    let access: string;
    let accessStrong: boolean;
    if (hasRead && hasWrite) {
        access = 'Read + Write';
        accessStrong = true;
    } else if (hasWrite) {
        access = 'Write';
        accessStrong = true;
    } else if (hasRead) {
        access = 'Read';
        accessStrong = false;
    } else {
        // Non-CRUD actions (e.g. `execute`) — label with the action itself.
        access = actions[0] ? titleizeScope(actions[0]) : 'Access';
        accessStrong = true;
    }

    return { title, description: copy?.desc, access, accessStrong };
}

/* -------------------------------------------------------------------------- */
/*  Read-only permission summary (Railway-style consent list)                 */
/* -------------------------------------------------------------------------- */

export interface PermissionLine {
    /** Row title — the resource name ("Tables"), or a descriptive title for account lines. */
    title: string;
    /** One-line description of what the resource covers. */
    description?: string;
    /** Raw scope token(s), space-joined, exactly as issued (incl. tier prefix). Never rendered
     *  inline — surfaced only via the hover copy affordance. */
    token: string;
    /** Access-level chip label, e.g. "Read" / "Write" / "Read + Write". Absent on account lines. */
    access?: string;
    /** Whether the chip should read as elevated (write access) rather than neutral (read-only). */
    accessStrong?: boolean;
}

export interface PermissionGroup {
    /** Section heading, e.g. `Account`, `Projects`, `Organizations`. */
    heading: string;
    /** Contextual note under the heading, e.g. which resources it applies to. */
    note?: string;
    lines: PermissionLine[];
}

/** Rank actions so `read` sorts before `write`, everything else after. */
function actionRank(action: string): number {
    if (action === 'read') return 0;
    if (action === 'write') return 1;
    return 2;
}

function actionOf(scope: string): string {
    const dot = scope.lastIndexOf('.');
    return dot === -1 ? scope : scope.slice(dot + 1);
}

function resourceOf(scope: string): string {
    const dot = scope.lastIndexOf('.');
    return dot === -1 ? scope : scope.slice(0, dot);
}

function tierLines(
    tier: TierScopes,
    prefix: string,
    allScope: string,
    copyMap: Record<string, ResourceCopy>
): PermissionLine[] {
    const lines: PermissionLine[] = [];
    if (tier.all) {
        lines.push({
            title:
                prefix === PROJECT_SCOPE_PREFIX
                    ? 'Full project access'
                    : 'Full organization access',
            description: `Grant every available permission on the selected ${
                prefix === PROJECT_SCOPE_PREFIX ? 'projects' : 'organizations'
            }.`,
            token: allScope
        });
    }

    // Group scopes by resource (everything before the last dot) so that, e.g.,
    // `tables.read` and `tables.write` collapse into a single "Tables" row with
    // one combined description.
    const groups = new Map<string, string[]>();
    for (const scope of tier.scopes) {
        const resource = resourceOf(scope);
        const bucket = groups.get(resource);
        if (bucket) bucket.push(scope);
        else groups.set(resource, [scope]);
    }

    // Order rows by how much access they grant — Read + Write first, then Write,
    // then any other action, and read-only last — so the strongest grants lead.
    const accessRank = (actions: string[]): number => {
        const hasRead = actions.includes('read');
        const hasWrite = actions.includes('write');
        if (hasRead && hasWrite) return 0;
        if (hasWrite) return 1;
        if (hasRead) return 3;
        return 2;
    };

    const groupLines = [...groups.entries()]
        .map(([resource, scopes]) => {
            scopes.sort((a, b) => actionRank(actionOf(a)) - actionRank(actionOf(b)));
            const actions = scopes.map(actionOf);
            const { title, description, access, accessStrong } = describeResource(
                resource,
                actions,
                copyMap
            );
            return {
                line: {
                    title,
                    description,
                    token: scopes.map((scope) => prefix + scope).join(' '),
                    access,
                    accessStrong
                },
                rank: accessRank(actions)
            };
        })
        // Stable sort: equal ranks keep their requested order.
        .sort((a, b) => a.rank - b.rank);

    for (const { line } of groupLines) lines.push(line);

    return lines;
}

/**
 * Build the read-only permission summary the consent screen displays. Scopes are
 * not individually selectable — the client decides what it requests — so this is
 * purely descriptive: each requested scope becomes a titled line grouped under
 * Account / Projects / Organizations, with the raw token shown for transparency.
 */
export function buildConsentPermissions(model: ConsentScopeModel): PermissionGroup[] {
    const groups: PermissionGroup[] = [];

    const account: PermissionLine[] = [];
    if (model.identity.length > 0) {
        account.push({
            title: 'View your identity',
            description: 'Confirm who you are and read your basic profile details.',
            token: model.identity.map((scope) => scope.id).join(' ')
        });
    }
    if (model.all) {
        account.push({
            title: model.all.title,
            description: model.all.description,
            token: model.all.id
        });
    }
    if (account.length > 0) {
        groups.push({ heading: 'Account', lines: account });
    }

    const projectLines = tierLines(
        model.project,
        PROJECT_SCOPE_PREFIX,
        PROJECT_ALL_SCOPE,
        PROJECT_RESOURCE_COPY
    );
    if (projectLines.length > 0) {
        groups.push({
            heading: 'Projects',
            note: 'Applies only to the projects you select below.',
            lines: projectLines
        });
    }

    const organizationLines = tierLines(
        model.organization,
        ORGANIZATION_SCOPE_PREFIX,
        ORGANIZATION_ALL_SCOPE,
        ORGANIZATION_RESOURCE_COPY
    );
    if (organizationLines.length > 0) {
        groups.push({
            heading: 'Organizations',
            note: 'Applies only to the organizations you select below.',
            lines: organizationLines
        });
    }

    return groups;
}
