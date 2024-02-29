import { goto } from '$app/navigation';
import { project } from '$routes/console/project-[project]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';

const getIcon = (provider) => {
    switch (provider.type) {
        case MessagingProviderType.Push:
            return 'device-mobile';
        case MessagingProviderType.Sms:
            return 'annotation';
        case MessagingProviderType.Email:
            return 'mail';
        default:
            return 'send';
    }
}

export const providersSearcher = (async (query: string) => {
    const { providers } = await sdk.forProject.messaging.listProviders([], query || undefined);

    console.log(providers);
    const projectId = get(project).$id;

    return providers
        .filter((provider) => provider.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (provider) =>
                ({
                    group: 'providers',
                    label:  provider.name,
                    callback: () => {
                        goto(`/console/project-${projectId}/messaging/providers/provider-${provider.$id}`);
                    },
                    icon: getIcon(provider),
                }) as const
        );
}) satisfies Searcher;
