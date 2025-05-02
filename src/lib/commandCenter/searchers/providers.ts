import { goto } from '$app/navigation';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { getProviderDisplayNameAndIcon } from '$routes/(console)/project-[region]-[project]/messaging/provider.svelte';
import { base } from '$app/paths';
import { page } from '$app/state';

const getIcon = (provider: string) => {
    const { icon } = getProviderDisplayNameAndIcon(provider);
    return icon;
};

export const providersSearcher = (async (query: string) => {
    const { providers } = await sdk
        .forProject(page.params.region, page.params.project)
        .messaging.listProviders([], query || undefined);

    return providers
        .filter((provider) => provider.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (provider) =>
                ({
                    group: 'providers',
                    label: provider.name,
                    callback: () => {
                        goto(
                            `${base}/project-${page.params.region}-${page.params.project}/messaging/providers/provider-${provider.$id}`
                        );
                    },
                    image: getIcon(provider.provider)
                }) as const
        );
}) satisfies Searcher;
