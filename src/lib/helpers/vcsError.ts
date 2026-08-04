/**
 * Classifying failures that come from the VCS installation itself rather than
 * from the repository, branch or directory being genuinely empty.
 *
 * Every VCS read endpoint (list repositories, list branches, list namespaces,
 * get repository contents) refreshes the installation's OAuth token first, so
 * a dead token surfaces as a failure on an otherwise ordinary list call. Left
 * unclassified these all render as a successful empty result ("No repositories
 * found", "No branches available", a spinner that never resolves), which is the
 * opposite of what happened.
 */

/**
 * How a failed VCS call should be explained to the user.
 *
 * - `reconnect` - the installation's stored OAuth token is dead and cannot be
 *   refreshed. Only the user can fix it, by re-authorizing the installation.
 * - `locked` - a concurrent token refresh holds the lock. Transient; retrying
 *   works. The installation is fine, so never lead with a reconnect here.
 * - `provider` - the provider itself failed (outage, rate limit). Also
 *   transient, but a dead token can land here too (see below), so a reconnect
 *   stays available as a secondary action.
 */
export type VcsInstallationErrorKind = 'reconnect' | 'locked' | 'provider';

/**
 * Classify an error thrown by a VCS endpoint that refreshes the installation
 * token. Returns `null` for anything that is not an installation-level failure,
 * so callers can fall through to their normal error handling.
 *
 * The API reports both a dead installation token and a genuine provider outage
 * as `general_provider_failure`, so the message substring is the only
 * discriminator we get: the token failures are the ones whose copy asks the
 * user to reconnect ("Please reconnect it.", "Please reconnect the
 * installation."). That copy is authored in the backend's
 * `Appwrite\Vcs\InstallationTokens` (`refresh()` and `exchange()`, see
 * `src/Appwrite/Vcs/InstallationTokens.php` in appwrite/appwrite); if it is
 * ever reworded this falls back to `provider`, which still shows a real error
 * and still offers a reconnect, just with outage-first wording.
 *
 * Deliberately a structural cast and not an `instanceof AppwriteException`
 * check: `hooks.client.ts` unwraps thrown SDK errors into plain
 * `{ message, status, type }` objects before they reach `page.error`, so an
 * `instanceof` check would miss exactly the load-function failures this exists
 * to catch.
 */
export function getVcsInstallationErrorKind(error: unknown): VcsInstallationErrorKind | null {
    if (!error || typeof error !== 'object') return null;

    const { type, message } = error as { type?: string; message?: string };

    if (type === 'general_resource_locked') return 'locked';
    if (type !== 'general_provider_failure') return null;

    const text = typeof message === 'string' ? message.toLowerCase() : '';
    return text.includes('reconnect') ? 'reconnect' : 'provider';
}
