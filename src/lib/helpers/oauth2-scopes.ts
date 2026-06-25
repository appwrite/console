import type { ComponentType } from 'svelte';
import {
    IconShieldCheck,
    IconUser,
    IconMail,
    IconIdentification,
    IconKey
} from '@appwrite.io/pink-icons-svelte';

export interface ScopeDescriptor {
    id: string;
    title: string;
    description: string;
    icon: ComponentType;
}

export const ACCOUNT_ADMIN_SCOPE = 'account.admin';

export const ACCOUNT_ADMIN_DESCRIPTOR: ScopeDescriptor = {
    id: ACCOUNT_ADMIN_SCOPE,
    title: 'Full access to your account',
    description: 'Manage your organizations, projects, and all their resources on your behalf.',
    icon: IconShieldCheck
};

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
        description: 'Read the email address associated with your account.',
        icon: IconMail
    },
    [ACCOUNT_ADMIN_SCOPE]: {
        title: ACCOUNT_ADMIN_DESCRIPTOR.title,
        description: ACCOUNT_ADMIN_DESCRIPTOR.description,
        icon: ACCOUNT_ADMIN_DESCRIPTOR.icon
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

export function describeScopes(scopes: string[]): ScopeDescriptor[] {
    return scopes.map(describeScope);
}

const CONSENT_IDENTITY_SCOPES = ['profile', 'email'] as const;

/**
 * Build the permission list for the console OAuth2 consent screen. The server
 * enforces scope-based access, so this maps 1:1 to the issued token: full access
 * only for `account.admin`, then identity scopes, then any granular scopes.
 * Falls back to the lone `openid` "Verify your identity" row so a minimal OIDC
 * request is never empty.
 */
export function describeConsentScopes(scopes: string[]): ScopeDescriptor[] {
    const requested = new Set(scopes);
    const admin = requested.has(ACCOUNT_ADMIN_SCOPE) ? [ACCOUNT_ADMIN_DESCRIPTOR] : [];
    const identity = CONSENT_IDENTITY_SCOPES.filter((scope) => requested.has(scope)).map(
        describeScope
    );
    const remaining = scopes.filter(
        (scope) =>
            scope !== 'openid' &&
            scope !== ACCOUNT_ADMIN_SCOPE &&
            !(CONSENT_IDENTITY_SCOPES as readonly string[]).includes(scope)
    );

    const described = [...admin, ...identity, ...remaining.map(describeScope)];
    if (described.length === 0 && requested.has('openid')) {
        return [describeScope('openid')];
    }

    return described;
}

export interface ScopeAction {
    /** Full scope id, e.g. `teams.write`. */
    id: string;
    /** Trailing verb, e.g. `read` / `write`. */
    action: string;
    /** Display label for the verb, e.g. `Read` / `Write`. */
    label: string;
}

export interface ScopeResourceGroup {
    /** Resource prefix, e.g. `teams` or `backups.policies`. */
    resource: string;
    /** Display title for the resource, e.g. `Teams`. */
    title: string;
    icon: ComponentType;
    actions: ScopeAction[];
}

export interface GroupedConsentScopes {
    /** `account.admin` full-access descriptor, when requested. */
    admin: ScopeDescriptor | null;
    /** OIDC identity scopes (openid/profile/email), always shown in full. */
    identity: ScopeDescriptor[];
    /** Every other granular scope, bucketed by resource for collapsing. */
    groups: ScopeResourceGroup[];
    /** Total count of granular scopes across all groups. */
    granularCount: number;
}

/**
 * Split a granular scope into its resource prefix and trailing action verb.
 * `teams.read` -> { resource: 'teams', action: 'read' }, and
 * `backups.policies.write` -> { resource: 'backups.policies', action: 'write' }.
 * Scopes without a `.` fall back to the whole scope as the resource.
 */
function splitScope(scope: string): { resource: string; action: string } {
    const lastDot = scope.lastIndexOf('.');
    if (lastDot <= 0) {
        return { resource: scope, action: '' };
    }
    return { resource: scope.slice(0, lastDot), action: scope.slice(lastDot + 1) };
}

/**
 * Group the consent scopes for the OAuth2 consent screen. `account.admin` and the
 * OIDC identity scopes stay as full, always-visible rows; everything else is
 * bucketed by resource (`teams`, `projects`, …) so the granular console scopes can
 * be tucked into a single collapsible section rather than a long flat list.
 * Resource and action order follow first appearance in the requested scopes.
 */
export function groupConsentScopes(scopes: string[]): GroupedConsentScopes {
    const requested = new Set(scopes);
    const admin = requested.has(ACCOUNT_ADMIN_SCOPE) ? ACCOUNT_ADMIN_DESCRIPTOR : null;
    const identity = CONSENT_IDENTITY_SCOPES.filter((scope) => requested.has(scope)).map(
        describeScope
    );

    const remaining = scopes.filter(
        (scope) =>
            scope !== 'openid' &&
            scope !== ACCOUNT_ADMIN_SCOPE &&
            !(CONSENT_IDENTITY_SCOPES as readonly string[]).includes(scope)
    );

    const byResource = new Map<string, ScopeResourceGroup>();
    for (const scope of remaining) {
        const { resource, action } = splitScope(scope);
        let group = byResource.get(resource);
        if (!group) {
            group = {
                resource,
                title: titleizeScope(resource),
                icon: IconKey,
                actions: []
            };
            byResource.set(resource, group);
        }
        if (!group.actions.some((existing) => existing.id === scope)) {
            group.actions.push({ id: scope, action, label: titleizeScope(action || scope) });
        }
    }

    const groups = [...byResource.values()];

    // Keep a non-empty consent screen for a minimal OIDC request.
    if (!admin && identity.length === 0 && groups.length === 0 && requested.has('openid')) {
        return { admin: null, identity: [describeScope('openid')], groups: [], granularCount: 0 };
    }

    return { admin, identity, groups, granularCount: remaining.length };
}
