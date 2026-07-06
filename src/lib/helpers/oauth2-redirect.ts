/**
 * Whether an OAuth2 redirect URI points back to the web (http/https) rather
 * than a native application deep link (e.g. cursor://). Native redirects hand
 * off to the OS and leave the tab open, so the console shows an outcome
 * screen instead of relying on the navigation.
 */
export function isWebRedirect(uri: string): boolean {
    try {
        const { protocol } = new URL(uri);
        return protocol === 'http:' || protocol === 'https:';
    } catch {
        return false;
    }
}
