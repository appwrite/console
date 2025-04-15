import { page } from '$app/stores';
import { derived, writable, type Writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

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
