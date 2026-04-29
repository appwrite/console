import { Dependencies } from '$lib/constants';
import { oAuthProviders } from '$lib/stores/oauth-providers';
import { sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';

/** Extract the appId equivalent from a typed OAuth2 provider model. */
function extractAppId(p: Record<string, unknown>): string {
    return (p['clientId'] ??
        p['appId'] ??
        p['oauthClientId'] ??
        p['oauth2ClientId'] ??
        p['applicationId'] ??
        p['serviceId'] ??
        p['apiKey'] ??
        p['publicKey'] ??
        p['appKey'] ??
        p['keyString'] ??
        p['customerKey'] ??
        p['key'] ??
        '') as string;
}

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.PROJECT);

    const providerList = await sdk
        .forProject(params.region, params.project)
        .project.listOAuth2Providers();

    const oauthProviders: Models.AuthProvider[] = providerList.providers
        .filter((p) => p.$id !== 'mock')
        .map((p) => {
            const raw = p as unknown as Record<string, unknown>;
            return {
                key: p.$id,
                name: oAuthProviders[p.$id]?.name ?? p.$id,
                appId: extractAppId(raw),
                secret: '',
                enabled: p.enabled
            };
        });

    return { oauthProviders };
};
