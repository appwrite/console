import { sdk } from '$lib/stores/sdk';
import { buildVerboseDomain } from '../../store.js';
import { ID } from '@appwrite.io/console';

export const load = async ({ parent, params }) => {
    const { installations, frameworks, project, organization, consoleVariables } = await parent();
    const template = await sdk.forProject.sites.getTemplate(params.template);
    const domain = await buildVerboseDomain(
        consoleVariables._APP_DOMAIN_SITES,
        template.name,
        organization.name,
        project.name,
        ID.unique()
    );

    return {
        installations,
        frameworks,
        template,
        domain
    };
};
