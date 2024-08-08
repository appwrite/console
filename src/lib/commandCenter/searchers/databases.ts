import { goto } from '$app/navigation';
import { project } from '$routes/(console)/project-[project]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';

export const dbSearcher = (async (query: string) => {
    const { databases } = await sdk.forProject.databases.list();

    return databases
        .filter((db) => db.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (db) =>
                ({
                    group: 'databases',
                    label: db.name,
                    callback: () => {
                        goto(`${base}/project-${get(project).$id}/databases/database-${db.$id}`);
                    },
                    icon: 'database'
                }) as const
        );
}) satisfies Searcher;
