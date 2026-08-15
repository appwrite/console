import { base } from '$app/paths';

/**
 * First-party clients may register a wide wordmark as `logoUri`. Consent and
 * outcome avatars are square, so `object-fit: cover` crops those marks into
 * unreadable fragments (see #3159 for Appwrite CLI). Prefer the square icon.
 */
const FIRST_PARTY_ICON_CLIENTS = new Set(['appwrite-cli']);

export function resolveOAuth2AppLogoUrl(
    app: { $id?: string; logoUri?: string } | null | undefined
): string {
    if (app?.$id && FIRST_PARTY_ICON_CLIENTS.has(app.$id)) {
        return `${base}/logos/appwrite-icon.svg`;
    }

    return app?.logoUri?.trim() ?? '';
}
