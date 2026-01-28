import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk.js';
import { isCloud } from '$lib/system.js';
import { redirectTo } from '$routes/store.js';
import { error, redirect } from '@sveltejs/kit';
import { getBasePlanFromGroup } from '$lib/stores/billing';
import { getTeamOrOrganizationList } from '$lib/stores/organization.js';
import { BillingPlanGroup, ID, type Models } from '@appwrite.io/console';

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

    const organizations = account?.$id ? await getTeamOrOrganizationList() : undefined;

    if (!organizations?.total && account?.$id) {
        await sdk.forConsole.organizations.create({
            organizationId: ID.unique(),
            name: 'Personal project',
            billingPlan: getBasePlanFromGroup(BillingPlanGroup.Starter).$id
        });
    }

    return {
        account,
        template: template,
        product,
        organizations
    };
};
