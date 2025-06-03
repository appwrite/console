import { goto } from '$app/navigation';
import { organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { base } from '$app/paths';

export const projectsSearcher = (async (query: string) => {
    const { projects } = await sdk.forConsole.projects.list([
        Query.equal('teamId', get(organization).$id),
        Query.orderDesc('')
    ]);

    return projects
        .filter((project) => project.name.toLowerCase().includes(query.toLowerCase()))
        .map((project) => {
            return {
                label: project.name,
                callback: () => {
                    goto(`${base}/project-${project.region}-${project.$id}`);
                },
                group: 'projects'
            } as const;
        });
}) satisfies Searcher;
