import { sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';

// CIMD (Client ID Metadata Document): a client_id may be an HTTPS URL pointing
// to a JSON document of RFC 7591 client metadata. The Appwrite API no longer
// resolves these, so the console fetches the document itself for branding.

const FETCH_TIMEOUT = 10_000;
const DEVICE_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:device_code';
const HTTP_URL = /^https?:\/\//i;

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

// Plain app IDs never parse as URLs; http is allowed for local development only.
export function isCimdClientId(clientId: string): boolean {
    try {
        const url = new URL(clientId);
        return (
            url.protocol === 'https:' ||
            (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
        );
    } catch {
        return false;
    }
}

export function cimdDocumentToApp(clientId: string, document: unknown): Models.App {
    if (typeof document !== 'object' || document === null) {
        throw new Error('CIMD document is not a JSON object');
    }
    const doc = document as CimdDocument;
    // The document's client_id must equal the URL it was fetched from.
    if (doc.client_id !== clientId) {
        throw new Error('CIMD document client_id does not match its URL');
    }
    const name = typeof doc.client_name === 'string' ? doc.client_name.trim() : '';
    return {
        $id: clientId,
        $createdAt: '',
        $updatedAt: '',
        name: name || new URL(clientId).hostname,
        description: '',
        // Untrusted values rendered in href/src must be http(s) URLs.
        clientUri:
            typeof doc.client_uri === 'string' && HTTP_URL.test(doc.client_uri)
                ? doc.client_uri
                : '',
        logoUri:
            typeof doc.logo_uri === 'string' && HTTP_URL.test(doc.logo_uri) ? doc.logo_uri : '',
        privacyPolicyUrl:
            typeof doc.policy_uri === 'string' && HTTP_URL.test(doc.policy_uri)
                ? doc.policy_uri
                : '',
        termsUrl: typeof doc.tos_uri === 'string' && HTTP_URL.test(doc.tos_uri) ? doc.tos_uri : '',
        contacts: Array.isArray(doc.contacts)
            ? doc.contacts.filter((contact) => typeof contact === 'string')
            : [],
        tagline: '',
        tags: [],
        labels: [],
        images: [],
        supportUrl: '',
        dataDeletionUrl: '',
        redirectUris: Array.isArray(doc.redirect_uris)
            ? doc.redirect_uris.filter((uri) => typeof uri === 'string')
            : [],
        postLogoutRedirectUris: Array.isArray(doc.post_logout_redirect_uris)
            ? doc.post_logout_redirect_uris.filter((uri) => typeof uri === 'string')
            : [],
        enabled: true,
        type: doc.token_endpoint_auth_method === 'none' ? 'public' : 'confidential',
        deviceFlow: Array.isArray(doc.grant_types) && doc.grant_types.includes(DEVICE_GRANT_TYPE),
        teamId: '',
        userId: '',
        installationScopes: [],
        installationRedirectUrl: '',
        secrets: []
    };
}

// Plain IDs resolve via the API; CIMD URLs are fetched directly. Fetch or
// validation failures fall back to hostname-only branding rather than blocking
// the flow — the server still validates the client during authorization.
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
        return cimdDocumentToApp(appId, { client_id: appId });
    }
}
