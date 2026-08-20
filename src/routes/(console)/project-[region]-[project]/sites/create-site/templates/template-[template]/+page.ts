import { sdk } from '$lib/stores/sdk';
import { ID, Query } from '@appwrite.io/console';
import { buildVerboseDomain } from '../../store.js';

export const load = async ({ parent, params }) => {
    const { installations, frameworks, project, organization, regionalConsoleVariables } =
        await parent();
    const projectSdk = sdk.forProject(params.region, params.project);
    const [template, siteList] = await Promise.all([
        projectSdk.sites.getTemplate({ templateId: params.template }),
        projectSdk.sites.list({ queries: [Query.limit(1)] })
    ]);
    const domain = await buildVerboseDomain(
        regionalConsoleVariables._APP_DOMAIN_SITES,
        template.name,
        organization.name,
        project.name,
        ID.unique()
    );

    return {
        installations,
        frameworks,
        template,
        domain,
        siteList
    };
};
