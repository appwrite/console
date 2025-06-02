import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { buildVerboseDomain } from '../../store.js';

export const load = async ({ parent, params }) => {
    const { installations, frameworks, project, organization, regionalConsoleVariables } =
        await parent();
    const template = await sdk
        .forProject(params.region, params.project)
        .sites.getTemplate(params.template);
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
        domain
    };
};
