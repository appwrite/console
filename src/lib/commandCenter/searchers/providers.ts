import { goto } from '$app/navigation';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { getProviderDisplayNameAndIcon } from '$routes/(console)/project-[project]/messaging/provider.svelte';
import { base } from '$app/paths';

const getIcon = (provider: string) => {
    const { icon } = getProviderDisplayNameAndIcon(provider);
    return icon;
};

export const providersSearcher = (async (query: string) => {
    const { providers } = await sdk.forProject.messaging.listProviders([], query || undefined);

    const projectId = get(project).$id;

    return providers
        .filter((provider) => provider.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (provider) =>
                ({
                    group: 'providers',
                    label: provider.name,
                    callback: () => {
                        goto(
                            `${base}/project-${projectId}/messaging/providers/provider-${provider.$id}`
                        );
                    },
                    image: getIcon(provider.provider)
                }) as const
        );
}) satisfies Searcher;
