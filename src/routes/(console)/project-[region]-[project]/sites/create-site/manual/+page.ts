import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { buildVerboseDomain } from '../store';

export const load = async ({ parent, params }) => {
    const { frameworks, project, organization, regionalConsoleVariables } = await parent();

    const domain = await buildVerboseDomain(
        regionalConsoleVariables._APP_DOMAIN_SITES,
        '', // name
        organization.name,
        project.name,
        ID.unique()
    );

    return {
        domain,
        frameworks,
        template: await sdk
            .forProject(params.region, params.project)
            .sites.getTemplate({ templateId: 'starter-for-js' })
    };
};
