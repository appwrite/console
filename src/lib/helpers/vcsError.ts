/**
 * Classifies failures coming from the VCS installation itself rather than from
 * a repository, branch or directory being genuinely empty. Every VCS read
 * endpoint refreshes the installation's OAuth token first, so a dead token
 * surfaces as a failure on an ordinary list call.
 *
 * - `reconnect` - the stored token is dead, only re-authorizing fixes it.
 * - `locked` - a concurrent refresh holds the lock, retrying works.
 * - `provider` - the provider failed (outage, rate limit), retry first.
 */
export type VcsInstallationErrorKind = 'reconnect' | 'locked' | 'provider';

/**
 * Returns `null` for anything that is not an installation-level failure, so
 * callers fall through to their normal error handling.
 *
 * The API reports a dead token and a provider outage identically as
 * `general_provider_failure`, so the message is the only discriminator: the
 * token failures are the ones asking the user to reconnect. That copy lives in
 * `Appwrite\Vcs\InstallationTokens` (appwrite/appwrite); reword it there and
 * this degrades to `provider`, which still shows a real error.
 *
 * Structural cast rather than `instanceof AppwriteException`, because
 * `hooks.client.ts` unwraps SDK errors into plain objects before they reach
 * `page.error`.
 */
export function getVcsInstallationErrorKind(error: unknown): VcsInstallationErrorKind | null {
    if (!error || typeof error !== 'object') return null;

    const { type, message } = error as { type?: string; message?: string };

    if (type === 'general_resource_locked') return 'locked';
    if (type !== 'general_provider_failure') return null;

    const text = typeof message === 'string' ? message.toLowerCase() : '';
    return text.includes('reconnect') ? 'reconnect' : 'provider';
}
