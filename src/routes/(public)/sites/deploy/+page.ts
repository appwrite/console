import { sdk } from '$lib/stores/sdk.js';
import { redirect, error } from '@sveltejs/kit';
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

    // Check deployment type - either template or repo
    const templateKey = url.searchParams.get('template');
    const repoUrl = url.searchParams.get('repo');

    // Must have either template or repo, but not both
    if (!templateKey && !repoUrl) {
        redirect(302, base + '/');
    }
    if (templateKey && repoUrl) {
        error(400, 'Cannot specify both template and repo parameters');
    }

    // Get common parameters
    const envParam = url.searchParams.get('env');
    const envKeys = envParam ? envParam.split(',').map((key: string) => key.trim()) : [];
    const screenshot = url.searchParams.get('screenshot');
    const name = url.searchParams.get('name');
    const tagline = url.searchParams.get('tagline');

    let deploymentData: {
        type: 'template' | 'repo';
        template?: Models.TemplateSite;
        repository?: { url: string; owner: string; name: string };
        screenshot?: string;
        name?: string;
        tagline?: string;
    };

    if (templateKey) {
        // Template deployment
        try {
            const template = await sdk.forConsole.sites.getTemplate(templateKey);
            deploymentData = {
                type: 'template',
                template,
                screenshot: screenshot || template.screenshotLight,
                name: name || template.name,
                tagline: tagline || template.tagline
            };
        } catch (e) {
            error(404, `Template "${templateKey}" not found`);
        }
    } else {
        // Repository deployment
        const repoMatch = repoUrl!.match(/github\.com[\/:]([^\/]+)\/([^\/\?\s]+)/);
        if (!repoMatch) {
            redirect(302, base + '/');
        }

        const [, owner, repoName] = repoMatch;
        // Clean repository name (remove .git extension if present)
        const cleanRepoName = repoName.replace(/\.git$/, '');

        deploymentData = {
            type: 'repo',
            repository: {
                url: repoUrl!,
                owner,
                name: cleanRepoName
            },
            screenshot,
            name: name || cleanRepoName,
            tagline
        };
    }

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
        envKeys
    };
};
