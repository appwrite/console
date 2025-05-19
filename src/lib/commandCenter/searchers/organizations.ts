import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import type { Searcher } from '../commands';
import { isCloud } from '$lib/system';

export const orgSearcher = (async (query: string) => {
    const { teams } = !isCloud
        ? await sdk.forConsole.teams.list()
        : await sdk.forConsole.organizations.list();

    return teams
        .filter((organization) => organization.name.toLowerCase().includes(query.toLowerCase()))
        .map((organization) => {
            return {
                label: organization.name,
                callback: () => {
                    goto(`${base}/organization-${organization.$id}`);
                },
                group: 'organizations'
            } as const;
        });
}) satisfies Searcher;
