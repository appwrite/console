import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { OAuthProvider, type Models } from '@appwrite.io/console';

type Args = {
    region: string;
    projectId: string;
    provider: Models.AuthProvider;
    appId: string;
    secret: string;
    details: Record<string, string>;
    enabled: boolean;
};

type Return = {
    status: 'success' | 'error';
    message?: string;
};

function parseSecret(secret: string) {
    if (!secret) return {};

    try {
        return JSON.parse(secret);
    } catch {
        return {};
    }
}

async function updateProjectOAuth({
    region,
    projectId,
    provider,
    appId,
    secret,
    details,
    enabled
}: Args) {
    const projectSdk = sdk.forProject(region, projectId).project;
    const parsedSecret = parseSecret(secret);

    const getDetail = (key: string): string => details[key] ?? '';

    switch (provider.key) {
        case OAuthProvider.Amazon:
            return projectSdk.updateOAuth2Amazon({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Apple:
            return projectSdk.updateOAuth2Apple({
                serviceId: appId || undefined,
                keyId: getDetail('keyId'),
                teamId: getDetail('teamId'),
                p8File: parsedSecret.p8File || undefined,
                enabled
            });
        case OAuthProvider.Auth0:
            return projectSdk.updateOAuth2Auth0({
                clientId: appId || undefined,
                clientSecret: parsedSecret.clientSecret || undefined,
                endpoint: getDetail('endpoint'),
                enabled
            });
        case OAuthProvider.Authentik:
            return projectSdk.updateOAuth2Authentik({
                endpoint: getDetail('endpoint'),
                clientId: appId || undefined,
                clientSecret: parsedSecret.clientSecret || undefined,
                enabled
            });
        case OAuthProvider.Autodesk:
            return projectSdk.updateOAuth2Autodesk({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Bitbucket:
            return projectSdk.updateOAuth2Bitbucket({
                key: appId || undefined,
                secret: secret || undefined,
                enabled
            });
        case OAuthProvider.Bitly:
            return projectSdk.updateOAuth2Bitly({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Box:
            return projectSdk.updateOAuth2Box({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Dailymotion:
            return projectSdk.updateOAuth2Dailymotion({
                apiKey: appId || undefined,
                apiSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Discord:
            return projectSdk.updateOAuth2Discord({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Disqus:
            return projectSdk.updateOAuth2Disqus({
                publicKey: appId || undefined,
                secretKey: secret || undefined,
                enabled
            });
        case OAuthProvider.Dropbox:
            return projectSdk.updateOAuth2Dropbox({
                appKey: appId || undefined,
                appSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Etsy:
            return projectSdk.updateOAuth2Etsy({
                keyString: appId || undefined,
                sharedSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Facebook:
            return projectSdk.updateOAuth2Facebook({
                appId: appId || undefined,
                appSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Figma:
            return projectSdk.updateOAuth2Figma({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Fusionauth:
            return projectSdk.updateOAuth2FusionAuth({
                endpoint: getDetail('endpoint'),
                clientId: appId || undefined,
                clientSecret: parsedSecret.clientSecret || undefined,
                enabled
            });
        case OAuthProvider.Github:
            return projectSdk.updateOAuth2GitHub({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Gitlab:
            return projectSdk.updateOAuth2Gitlab({
                applicationId: appId || undefined,
                secret: parsedSecret.secret || undefined,
                endpoint: getDetail('endpoint'),
                enabled
            });
        case OAuthProvider.Google:
            return projectSdk.updateOAuth2Google({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Keycloak:
            return projectSdk.updateOAuth2Keycloak({
                endpoint: getDetail('endpoint'),
                realmName: getDetail('realmName'),
                clientId: appId || undefined,
                clientSecret: parsedSecret.clientSecret || undefined,
                enabled
            });
        case OAuthProvider.Kick:
            return projectSdk.updateOAuth2Kick({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Linkedin:
            return projectSdk.updateOAuth2Linkedin({
                clientId: appId || undefined,
                primaryClientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Microsoft:
            return projectSdk.updateOAuth2Microsoft({
                tenant: getDetail('tenant'),
                applicationId: appId || undefined,
                applicationSecret: parsedSecret.applicationSecret || undefined,
                enabled
            });
        case OAuthProvider.Notion:
            return projectSdk.updateOAuth2Notion({
                oauthClientId: appId || undefined,
                oauthClientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Oidc:
            return projectSdk.updateOAuth2Oidc({
                clientId: appId || undefined,
                clientSecret: parsedSecret.clientSecret || undefined,
                wellKnownURL: getDetail('wellKnownURL'),
                authorizationURL: getDetail('authorizationURL'),
                tokenUrl: getDetail('tokenUrl'),
                userInfoUrl: getDetail('userInfoUrl'),
                enabled
            });
        case OAuthProvider.Okta:
            return projectSdk.updateOAuth2Okta({
                clientId: appId || undefined,
                clientSecret: parsedSecret.clientSecret || undefined,
                domain: getDetail('domain'),
                authorizationServerId: getDetail('authorizationServerId'),
                enabled
            });
        case OAuthProvider.Paypal:
            return projectSdk.updateOAuth2Paypal({
                clientId: appId || undefined,
                secretKey: secret || undefined,
                enabled
            });
        case OAuthProvider.PaypalSandbox:
            return projectSdk.updateOAuth2PaypalSandbox({
                clientId: appId || undefined,
                secretKey: secret || undefined,
                enabled
            });
        case OAuthProvider.Podio:
            return projectSdk.updateOAuth2Podio({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Salesforce:
            return projectSdk.updateOAuth2Salesforce({
                customerKey: appId || undefined,
                customerSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Slack:
            return projectSdk.updateOAuth2Slack({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Spotify:
            return projectSdk.updateOAuth2Spotify({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Stripe:
            return projectSdk.updateOAuth2Stripe({
                clientId: appId || undefined,
                apiSecretKey: secret || undefined,
                enabled
            });
        case OAuthProvider.Tradeshift:
            return projectSdk.updateOAuth2Tradeshift({
                oauth2ClientId: appId || undefined,
                oauth2ClientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.TradeshiftBox:
            return projectSdk.updateOAuth2TradeshiftSandbox({
                oauth2ClientId: appId || undefined,
                oauth2ClientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Twitch:
            return projectSdk.updateOAuth2Twitch({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Wordpress:
            return projectSdk.updateOAuth2WordPress({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.X:
            return projectSdk.updateOAuth2X({
                customerKey: appId || undefined,
                secretKey: secret || undefined,
                enabled
            });
        case OAuthProvider.Yahoo:
            return projectSdk.updateOAuth2Yahoo({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Yandex:
            return projectSdk.updateOAuth2Yandex({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Zoho:
            return projectSdk.updateOAuth2Zoho({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        case OAuthProvider.Zoom:
            return projectSdk.updateOAuth2Zoom({
                clientId: appId || undefined,
                clientSecret: secret || undefined,
                enabled
            });
        default:
            throw new Error(`Unsupported OAuth2 provider: ${provider.key}`);
    }
}

export async function updateOAuth({
    region,
    projectId,
    provider,
    appId,
    secret,
    details,
    enabled
}: Args): Promise<Return> {
    try {
        if (!isValueOfStringEnum(OAuthProvider, provider.key)) {
            throw new Error(`Invalid OAuth2 provider: ${provider.key}`);
        }

        await updateProjectOAuth({ region, projectId, provider, appId, secret, details, enabled });
        await invalidate(Dependencies.PROJECT);

        addNotification({
            type: 'success',
            message: `${provider.name} authentication has been updated`
        });
        trackEvent(Submit.ProviderUpdate, {
            provider,
            enabled
        });

        return { status: 'success' };
    } catch (e) {
        trackError(e, Submit.ProviderUpdate);
        return { status: 'error', message: e.message };
    }
}
