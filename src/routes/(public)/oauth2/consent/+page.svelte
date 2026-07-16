<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { AppwriteException, type Models } from '@appwrite.io/console';
    import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { logout } from '$lib/helpers/logout';
    import { isWebRedirect } from '$lib/helpers/oauth2-redirect';
    import OAuth2ConsentCard, { type OAuth2Outcome } from '../consent-card.svelte';
    import OAuth2OutcomeCard from '../outcome-card.svelte';
    import { OAuth2ErrorMessage, OAuth2ErrorType } from '../errors';

    type Phase = 'loading' | 'ready' | 'approved' | 'denied' | 'error';
    type Account = Models.User<Models.Preferences>;

    let phase = $state<Phase>('loading');
    let grant = $state<Models.Oauth2Grant | null>(null);
    let app = $state<Models.App | null>(null);
    let account = $state<Account | null>(null);
    let error = $state<string | null>(null);
    let completedRedirectUrl = $state<string | undefined>(undefined);
    let accountSwitchResumeUrl = $state<string | null>(null);

    const ACCOUNT_SWITCH_STORAGE_PREFIX = 'oauth2-account-switch:';

    function rememberAccountSwitchUrl(key: string, url: string) {
        sessionStorage.setItem(`${ACCOUNT_SWITCH_STORAGE_PREFIX}${key}`, url);
    }

    function accountSwitchUrlFor(key: string): string | null {
        return sessionStorage.getItem(`${ACCOUNT_SWITCH_STORAGE_PREFIX}${key}`);
    }

    // OIDC `max_age` is a non-negative integer count of seconds. Reject anything
    // else (e.g. `max_age=abc`) so we omit the param rather than forwarding NaN.
    function parseMaxAge(raw: string | null): number | undefined {
        if (!raw) return undefined;
        const value = Number(raw);
        return Number.isInteger(value) && value >= 0 ? value : undefined;
    }

    function getAccount(): Promise<Account | null> {
        return sdk.forConsole.account.get().catch(() => null) as Promise<Account | null>;
    }

    // The authorize-request fields shared verbatim between createPAR (pre-login
    // push) and authorize (authenticated direct path).
    function readAuthorizeParams(params: URLSearchParams) {
        const resources = params.getAll('resource');
        return {
            redirectUri: params.get('redirect_uri') ?? '',
            responseType: params.get('response_type') ?? 'code',
            scope: params.get('scope') ?? '',
            state: params.get('state') ?? undefined,
            nonce: params.get('nonce') ?? undefined,
            codeChallenge: params.get('code_challenge') ?? undefined,
            codeChallengeMethod: params.get('code_challenge_method') ?? undefined,
            prompt: params.get('prompt') ?? undefined,
            maxAge: parseMaxAge(params.get('max_age')),
            authorizationDetails: params.get('authorization_details') ?? undefined,
            resource: resources.length > 0 ? (resources as unknown as string) : undefined
        };
    }

    function goSignIn(resumeUrl?: string) {
        const target = resumeUrl ?? window.location.pathname + window.location.search;
        void goto(resolve(`/login?redirect=${encodeURIComponent(target)}`), {
            replaceState: true
        });
    }

    function fail(e: unknown, fallback: string) {
        error = (e as Error)?.message ?? fallback;
        phase = 'error';
    }

    // Load a grant + its app branding and render the consent card.
    async function loadConsent(
        grantId: string,
        cancelled: () => boolean,
        knownAccount?: Account | null
    ): Promise<void> {
        const loadedGrant = await sdk.forConsole.oauth2.getGrant({ grantId });
        const [loadedApp, loadedAccount] = await Promise.all([
            sdk.forConsole.apps.get({ appId: loadedGrant.appId }),
            knownAccount !== undefined ? Promise.resolve(knownAccount) : getAccount()
        ]);
        if (cancelled()) return;
        grant = loadedGrant;
        app = loadedApp;
        account = loadedAccount;
        phase = 'ready';
    }

    async function resumeFromGrant(grantId: string, cancelled: () => boolean): Promise<void> {
        accountSwitchResumeUrl = accountSwitchUrlFor(grantId);
        try {
            await loadConsent(grantId, cancelled);
        } catch (e: unknown) {
            if (cancelled()) return;
            if (e instanceof AppwriteException && e.code === 401) {
                goSignIn();
                return;
            }
            fail(e, OAuth2ErrorMessage.GRANT_INVALID);
        }
    }

    async function handleAuthorizeResult(
        result: Models.Oauth2Authorize,
        loggedInAccount: Account,
        clientId: string | null,
        fromRequestUri: boolean,
        cancelled: () => boolean
    ): Promise<void> {
        if (result.redirectUrl) {
            // Already consented — go straight back to the client.
            window.location.href = result.redirectUrl;
            if (!isWebRedirect(result.redirectUrl)) {
                completedRedirectUrl = result.redirectUrl;
                account = loggedInAccount;
                app = clientId
                    ? await sdk.forConsole.apps.get({ appId: clientId }).catch(() => null)
                    : null;
                if (cancelled()) return;
                phase = 'approved';
            }
            return;
        }
        if (result.grantId) {
            if (accountSwitchResumeUrl) {
                rememberAccountSwitchUrl(result.grantId, accountSwitchResumeUrl);
            }
            if (fromRequestUri) {
                // The handle is now consumed — rewrite to the grant URL so
                // reloads resume via getGrant instead of a dead request_uri.
                await goto(resolve(`/oauth2/consent?grant_id=${result.grantId}`), {
                    replaceState: true
                });
                return;
            }
            await loadConsent(result.grantId, cancelled, loggedInAccount);
            return;
        }
        error = OAuth2ErrorMessage.AUTHORIZE_FAILED;
        phase = 'error';
    }

    async function resumeFromRequestUri(
        clientId: string | null,
        requestUri: string,
        cancelled: () => boolean
    ): Promise<void> {
        accountSwitchResumeUrl = accountSwitchUrlFor(requestUri);
        const loggedInAccount = await getAccount();
        if (cancelled()) return;

        if (!loggedInAccount) {
            // Dereferencing while logged out can only 401; keep the
            // single-use handle untouched and go straight to login.
            goSignIn();
            return;
        }

        try {
            // The server rejects request_uri combined with any other
            // authorization param; only client_id may accompany it.
            const result = await sdk.forConsole.oauth2.authorize({
                clientId: clientId ?? undefined,
                requestUri
            });
            if (cancelled()) return;
            await handleAuthorizeResult(result, loggedInAccount, clientId, true, cancelled);
        } catch (e: unknown) {
            if (cancelled()) return;
            // Since only the handle is sent, oauth2_invalid_request can only
            // mean the handle is unusable.
            if (e instanceof AppwriteException && e.type === OAuth2ErrorType.INVALID_REQUEST) {
                error = OAuth2ErrorMessage.HANDLE_EXPIRED;
                phase = 'error';
                return;
            }
            fail(e, OAuth2ErrorMessage.AUTHORIZE_FAILED);
        }
    }

    // Pre-login entry with raw authorize params in the URL.
    async function startAuthorize(
        clientId: string,
        params: URLSearchParams,
        cancelled: () => boolean
    ): Promise<void> {
        const authorizeUrl = window.location.pathname + window.location.search;
        accountSwitchResumeUrl = authorizeUrl;
        const loggedInAccount = await getAccount();
        if (cancelled()) return;

        if (!loggedInAccount) {
            // Carry only a short request_uri through login — the full
            // consent URL travels inside the OAuth provider's `state`
            // during GitHub sign-in and can exceed its size limits.
            try {
                const par = await sdk.forConsole.oauth2.createPAR({
                    clientId,
                    ...readAuthorizeParams(params)
                });
                if (cancelled()) return;
                rememberAccountSwitchUrl(par.request_uri, authorizeUrl);
                goSignIn(
                    `${resolve('/oauth2/consent')}?client_id=${encodeURIComponent(clientId)}&request_uri=${encodeURIComponent(par.request_uri)}`
                );
            } catch {
                if (cancelled()) return;
                // PAR unavailable (older server) or invalid request —
                // fall back to the legacy full-URL redirect.
                goSignIn();
            }
            return;
        }

        // Authenticated: ask the server to create a grant (or detect an
        // existing approved identity), then render consent or redirect.
        try {
            const result = await sdk.forConsole.oauth2.authorize({
                clientId,
                ...readAuthorizeParams(params)
            });
            if (cancelled()) return;
            await handleAuthorizeResult(result, loggedInAccount, clientId, false, cancelled);
        } catch (e: unknown) {
            if (cancelled()) return;
            fail(e, OAuth2ErrorMessage.AUTHORIZE_FAILED);
        }
    }

    async function init(params: URLSearchParams, cancelled: () => boolean): Promise<void> {
        const grantId = params.get('grant_id');
        if (grantId) {
            await resumeFromGrant(grantId, cancelled);
            return;
        }

        const clientId = params.get('client_id');
        const requestUri = params.get('request_uri');
        if (requestUri) {
            await resumeFromRequestUri(clientId, requestUri, cancelled);
            return;
        }
        if (clientId) {
            await startAuthorize(clientId, params, cancelled);
            return;
        }

        error = OAuth2ErrorMessage.MISSING_REQUEST;
        phase = 'error';
    }

    function onDone(outcome: OAuth2Outcome, redirectUrl?: string) {
        completedRedirectUrl = redirectUrl;
        phase = outcome === 'approved' ? 'approved' : 'denied';
    }

    async function switchAccount() {
        if (!accountSwitchResumeUrl) return;
        phase = 'loading';
        try {
            await logout(false);
            goSignIn(accountSwitchResumeUrl);
        } catch (e: unknown) {
            fail(e, 'Failed to switch accounts');
        }
    }

    // A $derived string so identity-only replacements of page.url (e.g. login
    // calling invalidate(ACCOUNT) right after goto) don't restart the flow —
    // a restart would cancel an in-flight authorize and re-dereference an
    // already-consumed single-use request_uri.
    const authorizeQuery = $derived(page.url.searchParams.toString());

    let currentRun = 0;

    // Re-runs when the authorize params change (this route can stay mounted as
    // the router moves between requests). Reset to loading so a previously
    // loaded grant can never be approved against a different request.
    $effect(() => {
        const params = new URLSearchParams(authorizeQuery);
        const run = ++currentRun;

        phase = 'loading';
        error = null;
        completedRedirectUrl = undefined;
        accountSwitchResumeUrl = null;

        void init(params, () => run !== currentRun);

        return () => {
            currentRun++;
        };
    });
</script>

<svelte:head>
    <title>Authorize application - Appwrite</title>
</svelte:head>

<div class="consent-page">
    <div class="consent-card-wrapper">
        {#if phase === 'loading'}
            <div class="spinner-wrap">
                <Spinner size="l" />
            </div>
        {:else if phase === 'error'}
            <Card.Base padding="l" radius="l" style="width: 100%;">
                <Layout.Stack gap="l" alignItems="center" alignContent="center">
                    <div class="error-icon-wrap">
                        <Icon icon={IconExclamation} size="l" color="--fgcolor-danger" />
                    </div>
                    <Typography.Title size="m" align="center">
                        Authorization failed
                    </Typography.Title>
                    <Typography.Text variant="m-400" align="center">
                        {error}
                    </Typography.Text>
                    <Button on:click={() => goto(resolve('/'), { replaceState: true })}>
                        Go to console
                    </Button>
                </Layout.Stack>
            </Card.Base>
        {:else if phase === 'ready' && grant && app}
            <OAuth2ConsentCard
                {grant}
                {app}
                accountLabel={account?.email || account?.name || undefined}
                flow="authorization"
                onSwitchAccount={accountSwitchResumeUrl ? switchAccount : undefined}
                {onDone} />
        {:else if phase === 'approved' || phase === 'denied'}
            <OAuth2OutcomeCard
                outcome={phase}
                flow="authorization"
                {app}
                accountLabel={account?.email || account?.name || undefined}
                redirectUrl={completedRedirectUrl} />
        {/if}
    </div>
</div>

<style lang="scss">
    .consent-page {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .consent-card-wrapper {
        width: 100%;
        max-width: 28rem;
    }

    .spinner-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 16rem;
    }

    .error-icon-wrap {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: var(--bgcolor-danger-secondary, rgba(220, 38, 38, 0.1));
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
