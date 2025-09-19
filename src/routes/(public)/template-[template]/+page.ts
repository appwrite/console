import { BillingPlan } from '$lib/constants.js';
import { sdk } from '$lib/stores/sdk.js';
import { ID, type Models } from '@appwrite.io/console';
import { isCloud } from '$lib/system.js';
import { error, redirect } from '@sveltejs/kit';
import type { OrganizationList } from '$lib/stores/organization.js';
import { redirectTo } from '$routes/store.js';
import { base } from '$app/paths';

export const load = async ({ parent, url, params }) => {
    const { account } = await parent();

    if (!account && !isCloud) {
        redirectTo.set(url.pathname + url.search);
        redirect(302, base + '/login?redirect=' + url.pathname + url.search);
    }

    if (!url.searchParams.has('type')) {
        error(404, 'Type is not optional');
    }

    const product = url.searchParams.get('type');
    let template: Models.TemplateFunction | Models.TemplateSite;

    switch (product) {
        case 'function':
            template = await sdk.forConsole.functions.getTemplate({
                templateId: params.template
            });
            break;
        case 'site':
            template = await sdk.forConsole.sites.getTemplate({
                templateId: params.template
            });
            break;
        default:
            error(404, 'Type is not valid');
    }

    let organizations: Models.TeamList<Record<string, unknown>> | OrganizationList | undefined;
    if (isCloud) {
        organizations = account?.$id ? await sdk.forConsole.billing.listOrganization() : undefined;
    } else {
        organizations = account?.$id ? await sdk.forConsole.teams.list() : undefined;
    }

    if (!organizations?.total && account?.$id) {
        await sdk.forConsole.billing.createOrganization(
            ID.unique(),
            'Personal project',
            BillingPlan.FREE,
            null,
            null
        );
    }

    return {
        account,
        template: template,
        product,
        organizations
    };
};
