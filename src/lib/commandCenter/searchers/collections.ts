import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { project } from '$routes/console/project-[project]/store';

export const collectionsSearcher = (async (query: string) => {
    const { databases } = await sdk.forProject.databases.list();

    const projectId = get(project).$id;
    return databases
        .filter((db) => db.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (db) =>
                ({
                    group: 'databases',
                    label: db.name,
                    callback: () => {
                        goto(`/console/project-${projectId}/databases/database-${db.$id}`);
                    }
                } as const)
        );
}) satisfies Searcher;
