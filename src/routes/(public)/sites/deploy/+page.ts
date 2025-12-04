import { sdk } from '$lib/stores/sdk.js';
import { redirect, error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { isCloud } from '$lib/system';
import { BillingPlan } from '$lib/constants';
import { ID, type Models, Query } from '@appwrite.io/console';
import type { OrganizationList } from '$lib/stores/organization';
import { redirectTo } from '$routes/store';
import type { PageLoad } from './$types';
import { getRepositoryInfo, getBranchFromUrl } from '$lib/helpers/github';
import { parseEnvParam } from '$lib/helpers/env';

export const load: PageLoad = async ({ parent, url }) => {
    const { account } = await parent();

    const fullUrl = url.pathname + url.search;

    if (!account) {
        redirectTo.set(fullUrl);
        redirect(302, base + '/login?redirect=' + encodeURIComponent(fullUrl));
    }

    const templateKey = url.searchParams.get('template');
    const repository = url.searchParams.get('repo') || url.searchParams.get('repository');

    if (!templateKey && !repository) {
        redirect(302, base + '/');
    }

    if (templateKey && repository) {
        error(400, 'Cannot specify both template and repo parameters');
    }

    // Get common parameters
    const name = url.searchParams.get('name');
    const envParam = url.searchParams.get('env');
    const tagline = url.searchParams.get('tagline');
    const screenshot = url.searchParams.get('screenshot');

    const envVars = parseEnvParam(envParam);
    // Keep envKeys for backward compatibility (just the keys)
    const envKeys = envVars.map((v) => v.key);

    let deploymentData: {
        type: 'template' | 'repo';
        template?: Models.TemplateSite;
        repository?: { url: string; owner: string; name: string; branch?: string };
        screenshot?: string;
        name?: string;
        tagline?: string;
    };

    if (templateKey) {
        try {
            const template = await sdk.forConsole.sites.getTemplate({ templateId: templateKey });
            deploymentData = {
                type: 'template',
                template,
                name: name || template.name,
                tagline: tagline || template.tagline,
                // TODO: maybe get the browser's theme
                //  and select appropriate theme here.
                screenshot: screenshot || template.screenshotLight
            };
        } catch (e) {
            error(404, `Template "${templateKey}" not found`);
        }
    } else {
        const info = getRepositoryInfo(repository);
        if (!info) {
            redirect(302, base + '/');
        }

        // Extract branch from URL if present (e.g., github.com/owner/repo/tree/branch)
        const branchFromUrl = getBranchFromUrl(repository);

        deploymentData = {
            type: 'repo',
            repository: {
                url: repository,
                name: info.name,
                owner: info.owner,
                branch: branchFromUrl
            },
            screenshot,
            name: name || info.name,
            tagline
        };
    }

    let organizations: Models.TeamList<Record<string, unknown>> | OrganizationList | undefined;

    if (isCloud) {
        organizations = await sdk.forConsole.billing.listOrganization([
            Query.equal('platform', 'appwrite')
        ]);
    } else {
        organizations = await sdk.forConsole.teams.list();
    }

    if (!organizations?.total) {
        try {
            if (isCloud) {
                await sdk.forConsole.billing.createOrganization(
                    ID.unique(),
                    'Personal Projects',
                    BillingPlan.FREE,
                    null
                );
            } else {
                await sdk.forConsole.teams.create({
                    teamId: ID.unique(),
                    name: 'Personal Projects'
                });
            }

            // Refetch organizations after creation
            if (isCloud) {
                organizations = await sdk.forConsole.billing.listOrganization([
                    Query.equal('platform', 'appwrite')
                ]);
            } else {
                organizations = await sdk.forConsole.teams.list();
            }
        } catch (e) {
            // ignore
        }
    }

    return {
        account,
        organizations,
        deploymentData,
        envKeys,
        envVars
    };
};
