import { Dependencies } from '$lib/constants';
import { oAuthProviders } from '$lib/stores/oauth-providers';
import { sdk } from '$lib/stores/sdk';
import type { Models as ConsoleModels } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import type { AuthProvider } from '../updateOAuth';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.PROJECT);

    const [providerList, consoleProviderList] = await Promise.all([
        sdk.forProject(params.region, params.project).project.listOAuth2Providers(),
        sdk.forConsole.console.listOAuth2Providers()
    ]);

    const consoleParamsMap = new Map<string, ConsoleModels.ConsoleOAuth2ProviderParameter[]>();
    for (const cp of consoleProviderList.oAuth2Providers) {
        consoleParamsMap.set(cp.$id, cp.parameters ?? []);
    }

    const oauthProviders: AuthProvider[] = providerList.providers
        .filter((p) => p.$id !== 'mock')
        .map((p) => ({
            ...p,
            key: p.$id,
            name: oAuthProviders[p.$id]?.name ?? p.$id
        }));

    return { oauthProviders, consoleParamsMap };
};
