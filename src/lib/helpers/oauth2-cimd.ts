import { sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';

/**
 * CIMD (Client ID Metadata Document) support: a `client_id` may be an HTTPS
 * URL pointing to a JSON document of RFC 7591 client metadata. The Appwrite
 * API no longer resolves these — `apps.get()` accepts plain app IDs only — so
 * the console fetches the document itself for consent-screen branding. The
 * server still validates the client during authorization, so a failed fetch
 * only degrades branding, never security.
 */

const FETCH_TIMEOUT = 10_000;

const DEVICE_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:device_code';

/** The RFC 7591 metadata fields the console renders. */
type CimdDocument = {
    client_id?: unknown;
    client_name?: unknown;
    client_uri?: unknown;
    logo_uri?: unknown;
    policy_uri?: unknown;
    tos_uri?: unknown;
    contacts?: unknown;
    redirect_uris?: unknown;
    post_logout_redirect_uris?: unknown;
    token_endpoint_auth_method?: unknown;
    grant_types?: unknown;
};

function isLoopback(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

/**
 * Plain app IDs are at most 36 chars of `[a-zA-Z0-9._-]` and never parse as
 * absolute URLs, so anything URL-shaped is a CIMD client_id. HTTP is only
 * accepted for loopback (local development).
 */
export function isCimdClientId(clientId: string): boolean {
    let url: URL;
    try {
        url = new URL(clientId);
    } catch {
        return false;
    }
    return url.protocol === 'https:' || (url.protocol === 'http:' && isLoopback(url.hostname));
}

/** Documents are untrusted input — only pass through values safe to render in href/src. */
function httpUrl(value: unknown): string {
    if (typeof value !== 'string') return '';
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ? value : '';
    } catch {
        return '';
    }
}

function stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

/** A minimal app so consent can still render when the document is unavailable. */
function fallbackApp(clientId: string): Models.App {
    return {
        $id: clientId,
        $createdAt: '',
        $updatedAt: '',
        name: new URL(clientId).hostname,
        description: '',
        clientUri: '',
        logoUri: '',
        privacyPolicyUrl: '',
        termsUrl: '',
        contacts: [],
        tagline: '',
        tags: [],
        images: [],
        supportUrl: '',
        dataDeletionUrl: '',
        redirectUris: [],
        postLogoutRedirectUris: [],
        enabled: true,
        type: 'public',
        deviceFlow: false,
        teamId: '',
        userId: '',
        secrets: []
    };
}

export function cimdDocumentToApp(clientId: string, document: unknown): Models.App {
    if (typeof document !== 'object' || document === null) {
        throw new Error('CIMD document is not a JSON object');
    }
    const doc = document as CimdDocument;
    // The document's client_id MUST equal the URL it was fetched from — a
    // mismatch means the document describes a different client.
    if (doc.client_id !== clientId) {
        throw new Error('CIMD document client_id does not match its URL');
    }
    const name = typeof doc.client_name === 'string' ? doc.client_name.trim() : '';
    return {
        ...fallbackApp(clientId),
        name: name || new URL(clientId).hostname,
        clientUri: httpUrl(doc.client_uri),
        logoUri: httpUrl(doc.logo_uri),
        privacyPolicyUrl: httpUrl(doc.policy_uri),
        termsUrl: httpUrl(doc.tos_uri),
        contacts: stringArray(doc.contacts),
        redirectUris: stringArray(doc.redirect_uris),
        postLogoutRedirectUris: stringArray(doc.post_logout_redirect_uris),
        type: doc.token_endpoint_auth_method === 'none' ? 'public' : 'confidential',
        deviceFlow: stringArray(doc.grant_types).includes(DEVICE_GRANT_TYPE)
    };
}

/**
 * Resolve an app for display: plain IDs via the API, CIMD URLs by fetching
 * the document directly. CIMD fetch/validation failures fall back to
 * hostname-only branding rather than blocking the flow.
 */
export async function getOAuth2App(appId: string): Promise<Models.App> {
    if (!isCimdClientId(appId)) {
        return sdk.forConsole.apps.get({ appId });
    }
    try {
        const response = await fetch(appId, {
            headers: { accept: 'application/json' },
            credentials: 'omit',
            signal: AbortSignal.timeout(FETCH_TIMEOUT)
        });
        if (!response.ok) throw new Error(`CIMD document request failed: ${response.status}`);
        return cimdDocumentToApp(appId, await response.json());
    } catch {
        return fallbackApp(appId);
    }
}
