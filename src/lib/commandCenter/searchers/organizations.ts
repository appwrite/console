import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import type { Searcher } from '../commands';

export const orgSearcher = (async (query: string) => {
    const { teams } = await sdk.forConsole.teams.list();
    return teams
        .filter((organization) => organization.name.toLowerCase().includes(query.toLowerCase()))
        .map((organization) => {
            return {
                label: organization.name,
                callback: () => {
                    goto(`/console/organization-${organization.$id}`);
                },
                group: 'organizations'
            } as const;
        });
}) satisfies Searcher;
