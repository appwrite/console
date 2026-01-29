import { resolve } from '$app/paths';
import { goto } from '$app/navigation';
import type { Searcher } from '../commands';
import { getTeamOrOrganizationList } from '$lib/stores/organization';

export const orgSearcher = (async (query: string) => {
    const { teams } = await getTeamOrOrganizationList();

    return teams
        .filter((organization) => organization.name.toLowerCase().includes(query.toLowerCase()))
        .map((organization) => {
            return {
                label: organization.name,
                callback: () => {
                    goto(
                        resolve('/(console)/organization-[organization]', {
                            organization: organization.$id
                        })
                    );
                },
                group: 'organizations'
            } as const;
        });
}) satisfies Searcher;
