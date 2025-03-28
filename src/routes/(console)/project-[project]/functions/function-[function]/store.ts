import { page } from '$app/stores';
import { derived, writable, type Writable } from 'svelte/store';
import { DeploymentDownloadType, type Models } from '@appwrite.io/console';
import type { Column } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';

export const func = derived(page, ($page) => $page.data.function as Models.Function);
export const deploymentList = derived(
    page,
    ($page) => $page.data.deploymentList as Models.DeploymentList
);
export const proxyRuleList = derived(
    page,
    ($page) => $page.data.proxyRuleList as Models.ProxyRuleList
);

export const repositories: Writable<{
    search: string;
    installationId: string;
    repositories: Models.ProviderRepository[];
}> = writable({
    search: '',
    installationId: '',
    repositories: []
});

export const showCreateDeployment: Writable<boolean> = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Deployment ID', type: 'string', width: { min: 210, max: 250 } },
    {
        id: 'status',
        title: 'Status',
        type: 'enum',
        width: { min: 110, max: 140 },
        array: true,
        format: 'enum',
        elements: ['ready', 'processing', 'building', 'waiting', 'cancelled', 'failed'],
        filter: false
    },
    {
        id: 'buildDuration',
        title: 'Build duration',
        type: 'integer',
        width: { min: 110, max: 140 },
        elements: [
            {
                value: 15,
                label: 'more than 15 seconds'
            },
            {
                value: 60,
                label: 'more than 1 minute'
            },
            {
                value: 5 * 60,
                label: 'more than 5 minutes'
            }
        ],
        filter: false
    },
    {
        id: 'sourceSize',
        title: 'Source size',
        type: 'integer',
        width: { min: 140, max: 160 },

        elements: [
            {
                value: 2 * 1000 * 1000,
                label: 'more than 2MB'
            },
            {
                value: 10 * 1000 * 1000,
                label: 'more than 10MB'
            },
            {
                value: 50 * 1000 * 1000,
                label: 'more than 50MB'
            }
        ]
    },
    {
        id: 'buildSize',
        title: 'Build size',
        type: 'integer',
        hide: true,
        filter: false,
        width: { min: 110, max: 130 }
    },
    {
        id: 'type',
        title: 'Source',
        type: 'string',
        width: { min: 140, max: 160 },
        array: true,
        format: 'enum',
        elements: [
            { value: 'manual', label: 'Manual' },
            { value: 'cli', label: 'CLI' },
            { value: 'vcs', label: 'Git' }
        ]
    },
    {
        id: '$updatedAt',
        title: 'Updated',
        type: 'datetime',
        width: { min: 150, max: 180 },
        format: 'datetime'
    }
]);

export function getOutputDownload(funcId: string, deploymentId: string) {
    return (
        sdk.forProject.functions.getDeploymentDownload(
            funcId,
            deploymentId.toString(),
            DeploymentDownloadType.Output
        ) + '&mode=admin'
    );
}
export function getSourceDownload(funcId: string, deploymentId: string) {
    return (
        sdk.forProject.functions.getDeploymentDownload(
            funcId,
            deploymentId.toString(),
            DeploymentDownloadType.Source
        ) + '&mode=admin'
    );
}
