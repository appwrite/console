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
