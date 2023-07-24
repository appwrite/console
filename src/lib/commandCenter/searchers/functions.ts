import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import { project } from '$routes/console/project-[project]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';

export const functionsSearcher = (async (query: string) => {
    const { functions } = await sdk.forProject.functions.list();

    const projectId = get(project).$id;
    return functions
        .filter((fn) => fn.name.toLowerCase().includes(query.toLowerCase()))
        .map((fn) => ({
            label: fn.name,
            callback: () => {
                goto(`/console/project-${projectId}/functions/function-${fn.$id}`);
            },
            group: 'functions'
        }));
}) satisfies Searcher;
