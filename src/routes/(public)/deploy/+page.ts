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

    // Get repository URL from query params
    const repoUrl = url.searchParams.get('repo');
    if (!repoUrl) {
        redirect(302, base + '/');
    }

    // Parse repository information
    const repoMatch = repoUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\?\s]+)/);
    if (!repoMatch) {
        redirect(302, base + '/');
    }

    const [, owner, repoName] = repoMatch;
    // Clean repository name (remove .git extension if present)
    const cleanRepoName = repoName.replace(/\.git$/, '');

    // Get environment variables from query params
    const envParam = url.searchParams.get('env');
    const envKeys = envParam ? envParam.split(',').map((key: string) => key.trim()) : [];

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
        repository: {
            url: repoUrl,
            owner,
            name: cleanRepoName
        },
        envKeys
    };
};
