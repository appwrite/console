import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import type { Searcher } from '../commands';
import type { Models } from '@appwrite.io/console';
import { page } from '$app/state';
import { IconLightningBolt, IconPlus } from '@appwrite.io/pink-icons-svelte';
import { getProjectRoute } from '$lib/helpers/project';
import { showCreateDeployment } from '$routes/(console)/project-[region]-[project]/functions/function-[function]/store';

const getFunctionCommand = (fn: Models.Function, region: string, projectId: string) => {
    return {
        label: fn.name,
        callback: () =>
            goto(getProjectRoute({ $id: projectId, region }, `/functions/function-${fn.$id}`)),
        group: 'functions',
        icon: IconLightningBolt
    } as const;
};

export const functionsSearcher = (async (query: string) => {
    const { functions } = await sdk
        .forProject(page.params.region, page.params.project)
        .functions.list();

    const filtered = functions.filter((fn) => fn.name.toLowerCase().includes(query.toLowerCase()));

    if (filtered.length === 1) {
        const func = filtered[0];
        return [
            getFunctionCommand(func, page.params.region, page.params.project),
            {
                label: 'Create deployment',
                nested: true,
                async callback() {
                    if (!page.url.pathname.endsWith(func.$id)) {
                        await goto(getProjectRoute(`/functions/function-${func.$id}`));
                    }
                    showCreateDeployment.set(true);
                },
                group: 'functions',
                icon: IconPlus
            },
            {
                label: 'Go to deployments',
                nested: true,
                callback() {
                    goto(getProjectRoute(`/functions/function-${func.$id}`));
                },
                group: 'functions'
            },
            {
                label: 'Go to usage',
                nested: true,
                callback() {
                    goto(getProjectRoute(`/functions/function-${func.$id}/usage`));
                },
                group: 'functions'
            },
            {
                label: 'Go to executions',
                nested: true,
                callback() {
                    goto(getProjectRoute(`/functions/function-${func.$id}/executions`));
                },
                group: 'functions'
            },
            {
                label: 'Go to settings',
                nested: true,
                callback() {
                    goto(getProjectRoute(`/functions/function-${func.$id}/settings`));
                },
                group: 'functions'
            }
        ];
    }

    return filtered.map((fn) => getFunctionCommand(fn, page.params.region, page.params.project));
}) satisfies Searcher;
