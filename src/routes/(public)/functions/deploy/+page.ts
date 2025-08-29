import { sdk } from '$lib/stores/sdk.js';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { isCloud } from '$lib/system';
import { BillingPlan } from '$lib/constants';
import { ID, type Models } from '@appwrite.io/console';
import type { OrganizationList } from '$lib/stores/organization';
import { redirectTo } from '$routes/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
    const { account } = await parent();

    // Store the full URL for redirect after auth
    const fullUrl = url.pathname + url.search;

    // Check if user is authenticated
    if (!account) {
        redirectTo.set(fullUrl);
        redirect(302, base + '/login?redirect=' + encodeURIComponent(fullUrl));
    }

    // Check deployment type - repo only for functions
    const repoUrl = url.searchParams.get('repo');
    const runtime = url.searchParams.get('runtime');

    // Must have repo
    if (!repoUrl) {
        redirect(302, base + '/');
    }

    // Get common parameters
    const envParam = url.searchParams.get('env');
    const envKeys = envParam ? envParam.split(',').map((key: string) => key.trim()) : [];
    const name = url.searchParams.get('name');

    const deploymentData: {
        type: 'repo';
        repository: { url: string; owner: string; name: string };
        runtime?: string;
        name?: string;
    } = {
        type: 'repo',
        repository: {
            url: repoUrl!,
            owner: '',
            name: ''
        },
        runtime: runtime || 'node-18.0',
        name: name || ''
    };

    // Get available runtimes
    const runtimesList = await sdk.forConsole.functions.listRuntimes();

    // Repository deployment only
    const repoMatch = repoUrl!.match(/github\.com[/:]([^/]+)\/([^/?s]+)/);
    if (!repoMatch) {
        redirect(302, base + '/');
    }

    const [, owner, repoName] = repoMatch;
    // Clean repository name (remove .git extension if present)
    const cleanRepoName = repoName.replace(/\.git$/, '');

    // Update deployment data with parsed repository info
    deploymentData.repository.owner = owner;
    deploymentData.repository.name = cleanRepoName;
    deploymentData.name = name || cleanRepoName;

    // Get organizations
    let organizations: Models.TeamList<Record<string, unknown>> | OrganizationList | undefined;
    if (isCloud) {
        organizations = await sdk.forConsole.billing.listOrganization();
    } else {
        organizations = await sdk.forConsole.teams.list();
    }

    // Create default organization if none exists - matches console's onboarding behavior
    if (!organizations?.total) {
        let org = null;
        try {
            if (isCloud) {
                org = await sdk.forConsole.billing.createOrganization(
                    ID.unique(),
                    'Personal Projects',
                    BillingPlan.FREE,
                    null,
                    null
                );
            } else {
                org = await sdk.forConsole.teams.create(ID.unique(), 'Personal Projects');
            }

            // Refetch organizations after creation
            if (isCloud) {
                organizations = await sdk.forConsole.billing.listOrganization();
            } else {
                organizations = await sdk.forConsole.teams.list();
            }
        } catch (e) {
            // If organization creation fails, still redirect to deploy page
            // The page will handle showing an error
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
