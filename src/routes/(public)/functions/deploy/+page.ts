import { sdk } from '$lib/stores/sdk.js';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { isCloud } from '$lib/system';
import { BillingPlanGroup, ID } from '@appwrite.io/console';
import { getTeamOrOrganizationList } from '$lib/stores/organization';
import { redirectTo } from '$routes/store';
import type { PageLoad } from './$types';
import { getRepositoryInfo } from '$lib/helpers/github';
import { getBasePlanFromGroup } from '$lib/stores/billing';

export const load: PageLoad = async ({ parent, url }) => {
    const { account } = await parent();

    const fullUrl = url.pathname + url.search;

    if (!account) {
        redirectTo.set(fullUrl);
        redirect(302, base + '/login?redirect=' + encodeURIComponent(fullUrl));
    }

    const runtime = url.searchParams.get('runtime');
    const repository = url.searchParams.get('repo') || url.searchParams.get('repository');

    if (!repository) {
        redirect(302, base + '/');
    }

    // Get common parameters
    const name = url.searchParams.get('name');
    const envParam = url.searchParams.get('env');
    const envKeys = envParam ? envParam.split(',').map((key: string) => key.trim()) : [];

    const deploymentData: {
        type: 'repo';
        repository: {
            url: string;
            owner?: string;
            name?: string;
            rootDirectory?: string;
        };
        runtime?: string;
        name?: string;
    } = {
        type: 'repo',
        repository: {
            url: repository!,
            rootDirectory: null
        },
        name: name || '',
        runtime: runtime || 'node-18.0'
    };

    // Get available runtimes
    const runtimesList = await sdk.forConsole.functions.listRuntimes();

    const info = getRepositoryInfo(repository);
    if (!info) {
        redirect(302, base + '/');
    }

    deploymentData.name = name || info.name;
    deploymentData.repository.name = info.name;
    deploymentData.repository.owner = info.owner;

    // Get organizations
    let organizations = await getTeamOrOrganizationList();

    if (!organizations?.total) {
        try {
            if (isCloud) {
                await sdk.forConsole.organizations.create(
                    ID.unique(),
                    'Personal Projects',
                    getBasePlanFromGroup(BillingPlanGroup.Starter).$id,
                    null
                );
            } else {
                await sdk.forConsole.teams.create({
                    teamId: ID.unique(),
                    name: 'Personal Projects'
                });
            }

            organizations = await getTeamOrOrganizationList();
        } catch (e) {
            console.error('Failed to create default organization:', e);
        }
    }

    return {
        account,
        organizations,
        deploymentData,
        envKeys,
        runtimesList
    };
};
