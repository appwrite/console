import { goto } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import type { Models } from '@appwrite.io/console';
import { page } from '$app/stores';
import { showCreateDeployment } from '$routes/(console)/project-[region]-[project]/functions/function-[function]/store';
import { base } from '$app/paths';
import { IconLightningBolt, IconPlus } from '@appwrite.io/pink-icons-svelte';

const getFunctionCommand = (fn: Models.Function, region: string, projectId: string) => {
    return {
        label: fn.name,
        callback: () => {
            goto(`${base}/project-${region}-${projectId}/functions/function-${fn.$id}`);
        },
        group: 'functions',
        icon: IconLightningBolt
    } as const;
};

export const functionsSearcher = (async (query: string) => {
    const $page = get(page);
    const projectId = get(project).$id;
    const { functions } = await sdk
        .forProject($page.params.region, $page.params.project)
        .functions.list();

    const filtered = functions.filter((fn) => fn.name.toLowerCase().includes(query.toLowerCase()));

    if (filtered.length === 1) {
        const func = filtered[0];
        return [
            getFunctionCommand(func, $page.params.region, projectId),
            {
                label: 'Create deployment',
                nested: true,
                async callback() {
                    const $page = get(page);
                    if (!$page.url.pathname.endsWith(func.$id)) {
                        await goto(
                            `${base}/project-${$page.params.region}-${projectId}/functions/function-${func.$id}`
                        );
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
                    goto(
                        `${base}/project-${$page.params.region}-${projectId}/functions/function-${func.$id}`
                    );
                },
                group: 'functions'
            },
            {
                label: 'Go to usage',
                nested: true,
                callback() {
                    goto(
                        `${base}/project-${$page.params.region}-${projectId}/functions/function-${func.$id}/usage`
                    );
                },
                group: 'functions'
            },
            {
                label: 'Go to executions',
                nested: true,
                callback() {
                    goto(
                        `${base}/project-${$page.params.region}-${projectId}/functions/function-${func.$id}/executions`
                    );
                },
                group: 'functions'
            },
            {
                label: 'Go to settings',
                nested: true,
                callback() {
                    goto(
                        `${base}/project-${$page.params.region}-${projectId}/functions/function-${func.$id}/settings`
                    );
                },
                group: 'functions'
            }
        ];
    }

    return filtered.map((fn) => getFunctionCommand(fn, $page.params.region, projectId));
}) satisfies Searcher;
