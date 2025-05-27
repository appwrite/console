import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { buildVerboseDomain } from '../../store';

export const load = async ({ parent, params, url }) => {
    const { installations, frameworks, project, organization, consoleVariables } = await parent();
    const [repository] = await Promise.all([
        sdk
            .forProject(params.region, params.project)
            .vcs.getRepository(url.searchParams.get('installation'), params.repository)
    ]);

    const domain = await buildVerboseDomain(
        consoleVariables._APP_DOMAIN_SITES,
        repository.name,
        organization.name,
        project.name,
        ID.unique()
    );

    return {
        installations,
        installation: installations.installations.find(
            (installation) => installation.$id === url.searchParams.get('installation')
        ),
        repository,
        frameworks,
        domain
    };
};
