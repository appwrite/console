import { goto } from '$app/navigation';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { IconDatabase } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';
import { getProjectRoute } from '$lib/helpers/project';

export const dbSearcher = (async (query: string) => {
    const { databases } = await sdk
        .forProject(page.params.region, page.params.project)
        .databases.list();

    return databases
        .filter((db) => db.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (db) =>
                ({
                    group: 'databases',
                    label: db.name,
                    callback: () => goto(getProjectRoute(`/databases/database-${db.$id}`)),
                    icon: IconDatabase
                }) as const
        );
}) satisfies Searcher;
