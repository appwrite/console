<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { AppwriteException, Client, Oauth2, type Models } from '@appwrite.io/console';
    import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { isWebRedirect } from '$lib/helpers/oauth2-redirect';
    import OAuth2ConsentCard, { type OAuth2Outcome } from '../consent-card.svelte';
    import OAuth2OutcomeCard from '../outcome-card.svelte';

    type Phase = 'loading' | 'ready' | 'approved' | 'denied' | 'error';

    let phase = $state<Phase>('loading');
    let grant = $state<Models.Oauth2Grant | null>(null);
    let app = $state<Models.App | null>(null);
    let account = $state<Models.User<Models.Preferences> | null>(null);
    let error = $state<string | null>(null);
    let completedRedirectUrl = $state<string | undefined>(undefined);

    // OIDC `max_age` is a non-negative integer count of seconds. Reject anything
    // else (e.g. `max_age=abc`) so we omit the param rather than forwarding NaN.
    function parseMaxAge(raw: string | null): number | undefined {
        if (!raw) return undefined;
        const value = Number(raw);
        return Number.isInteger(value) && value >= 0 ? value : undefined;
    }

    function onDone(outcome: OAuth2Outcome, redirectUrl?: string) {
        completedRedirectUrl = redirectUrl;
        phase = outcome === 'approved' ? 'approved' : 'denied';
    }

    // PAR is a public client endpoint (like /token): the server serves it with
    // wildcard CORS and credentials disabled, so the browser rejects the
    // console SDK's default credentialed fetch. Call it through an anonymous
    // client that omits cookies — the endpoint needs no session anyway.
    function anonymousOAuth2(): Oauth2 {
        const client = new Client()
            .setEndpoint(sdk.forConsole.client.config.endpoint)
            .setProject('console')
            .setCredentials('omit');
        return new Oauth2(client);
    }

    // The ENTIRE query string, so the flow restarts whenever any part of the
    // authorize request changes — not just grant_id/client_id, but also
    // redirect_uri, scope, state, nonce, PKCE fields, prompt, max_age,
    // authorization_details and request_uri. A $derived string (rather than
    // reading page.url in the effect) so identity-only replacements of the
    // URL object — e.g. login calling invalidate(ACCOUNT) right after goto —
    // do NOT re-run the flow: a rerun would cancel an in-flight authorize
    // and, on the PAR path, re-dereference an already-consumed single-use
    // request_uri handle.
    const authorizeQuery = $derived(page.url.searchParams.toString());

    // Re-runs when the authorize params change (this route can stay mounted as
    // the router moves between requests). Reset to loading so a previously
    // loaded grant can never be approved against a different request.
    $effect(() => {
        const query = authorizeQuery;

        let cancelled = false;
        phase = 'loading';
        error = null;
        completedRedirectUrl = undefined;

        const currentRelativeUrl = () => window.location.pathname + window.location.search;

        const goSignIn = (resumeUrl?: string) => {
            const target = resumeUrl ?? currentRelativeUrl();
            void goto(`${base}/login?redirect=${encodeURIComponent(target)}`, {
                replaceState: true
            });
        };

        // Load a grant + its app branding and render the consent card.
        async function loadConsent(
            grantId: string,
            knownAccount?: Models.User<Models.Preferences> | null
        ): Promise<void> {
            const loadedGrant = await sdk.forConsole.oauth2.getGrant({ grantId });
            const [loadedApp, loadedAccount] = await Promise.all([
                sdk.forConsole.apps.get({ appId: loadedGrant.appId }),
                knownAccount !== undefined
                    ? Promise.resolve(knownAccount)
                    : (sdk.forConsole.account
                          .get()
                          .catch(() => null) as Promise<Models.User<Models.Preferences> | null>)
            ]);
            if (cancelled) return;
            grant = loadedGrant;
            app = loadedApp;
            account = loadedAccount;
            phase = 'ready';
        }

        async function init(): Promise<void> {
            const params = new URLSearchParams(query);
            const grantId = params.get('grant_id');

            if (grantId) {
                try {
                    await loadConsent(grantId);
                } catch (e: unknown) {
                    if (cancelled) return;
                    if (e instanceof AppwriteException && e.code === 401) {
                        goSignIn();
                        return;
                    }
                    error =
                        (e as Error)?.message ??
                        'This authorization request is invalid or has expired.';
                    phase = 'error';
                }
                return;
            }

            // Shared handling for a JSON authorize response, whether the request
            // arrived as raw params or as a pushed request_uri handle.
            async function handleAuthorizeResult(
                result: Models.Oauth2Authorize,
                loggedInAccount: Models.User<Models.Preferences>,
                clientId: string | null,
                fromRequestUri: boolean
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
                        if (cancelled) return;
                        phase = 'approved';
                    }
                    return;
                }
                if (result.grantId) {
                    if (fromRequestUri) {
                        // The pushed request handle is single-use and now consumed.
                        // Rewrite the URL to the grant so a reload or back/forward
                        // navigation resumes via getGrant instead of failing on a
                        // dead request_uri. The effect re-runs and loads the grant.
                        await goto(`${base}/oauth2/consent?grant_id=${result.grantId}`, {
                            replaceState: true
                        });
                        return;
                    }
                    await loadConsent(result.grantId, loggedInAccount);
                    return;
                }
                error = 'Could not start authorization.';
                phase = 'error';
            }

            const clientId = params.get('client_id');
            const requestUri = params.get('request_uri');

            // Pushed authorization request (PAR) resume: we round-tripped a short
            // request_uri handle through login instead of the full authorize URL.
            if (requestUri) {
                const loggedInAccount = (await sdk.forConsole.account
                    .get()
                    .catch(() => null)) as Models.User<Models.Preferences> | null;
                if (cancelled) return;

                if (!loggedInAccount) {
                    // The handle is single-use: never dereference it while logged
                    // out — the server consumes it before rejecting the call.
                    goSignIn();
                    return;
                }

                try {
                    const result = await sdk.forConsole.oauth2.authorize({
                        // request_uri must not be combined with any other
                        // authorization param; client_id is the only one the
                        // server accepts alongside it (and must match).
                        clientId: clientId ?? undefined,
                        requestUri
                    });
                    if (cancelled) return;
                    await handleAuthorizeResult(result, loggedInAccount, clientId, true);
                } catch (e: unknown) {
                    if (cancelled) return;
                    // The server reports every dead-handle case — expired,
                    // already consumed, malformed — as `oauth2_invalid_request`.
                    // Since this call sends nothing but the handle, that type
                    // can only mean the handle itself is no longer usable.
                    const invalidHandle =
                        e instanceof AppwriteException && e.type === 'oauth2_invalid_request';
                    error = invalidHandle
                        ? 'This sign-in request has expired. Return to the application and try connecting again.'
                        : ((e as Error)?.message ?? 'Could not start authorization.');
                    phase = 'error';
                }
                return;
            }

            // No grant yet: this is the pre-login entry with raw authorize params.
            if (clientId) {
                const loggedInAccount = (await sdk.forConsole.account
                    .get()
                    .catch(() => null)) as Models.User<Models.Preferences> | null;
                if (cancelled) return;

                if (!loggedInAccount) {
                    // Push the authorization request server-side and carry only a
                    // short request_uri through login. The full consent URL rides
                    // inside the OAuth provider's `state` during GitHub sign-in
                    // and can exceed the provider's size limits.
                    const resources = params.getAll('resource');
                    try {
                        const par = await anonymousOAuth2().createPAR({
                            clientId,
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
                            // The SDK types `resource` as a string but the server
                            // accepts a URI list (RFC 8707 allows repeated values).
                            resource:
                                resources.length > 0 ? (resources as unknown as string) : undefined
                        });
                        if (cancelled) return;
                        goSignIn(
                            `${base}/oauth2/consent?client_id=${encodeURIComponent(clientId)}&request_uri=${encodeURIComponent(par.request_uri)}`
                        );
                    } catch {
                        if (cancelled) return;
                        // PAR unavailable (older server) or the request is invalid.
                        // Fall back to the legacy full-URL redirect; validation
                        // errors resurface via authorize after login.
                        goSignIn();
                    }
                    return;
                }

                // Authenticated: ask the server to create a grant (or detect an
                // existing approved identity) via the SDK, then render consent or
                // redirect.
                try {
                    const result = await sdk.forConsole.oauth2.authorize({
                        clientId,
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
                        resource: params.get('resource') ?? undefined
                    });
                    if (cancelled) return;
                    await handleAuthorizeResult(result, loggedInAccount, clientId, false);
                } catch (e: unknown) {
                    if (cancelled) return;
                    error = (e as Error)?.message ?? 'Could not start authorization.';
                    phase = 'error';
                }
                return;
            }

            error = 'Missing authorization request. Open this page from an application sign-in.';
            phase = 'error';
        }

        void init();

        return () => {
            cancelled = true;
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
                    <Button on:click={() => goto(base, { replaceState: true })}>
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
