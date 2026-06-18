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

/**
 * This consent screen always authorizes against the Appwrite **console**
 * project. On the server, any OAuth2 access token issued for the console
 * project is granted the full `users` (member) role — the same access a
 * signed-in console session has — regardless of the OIDC scopes requested.
 * The `openid`/`profile`/`email` scopes only shape the OIDC identity claims;
 * they do NOT limit what the application can do. So the consent screen must
 * lead with the full-access reality rather than implying read-only access.
 */
export const FULL_ACCESS_SCOPE: ScopeDescriptor = {
    id: '__full_access__',
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

// Identity scopes shown (in this order) as secondary detail beneath the
// full-access item. `openid` is intentionally omitted — identity verification
// is implied by full account access, so listing it separately is redundant.
const CONSENT_IDENTITY_SCOPES = ['profile', 'email'] as const;

/**
 * Build the permission list for the console OAuth2 consent screen. Always leads
 * with the full-access item (the true effect of authorizing), followed by the
 * identity scopes the application actually reads (profile, email) when present.
 */
export function describeConsentScopes(scopes: string[]): ScopeDescriptor[] {
    const requested = new Set(scopes);
    const identity = CONSENT_IDENTITY_SCOPES.filter((scope) => requested.has(scope)).map(
        describeScope
    );
    return [FULL_ACCESS_SCOPE, ...identity];
}
