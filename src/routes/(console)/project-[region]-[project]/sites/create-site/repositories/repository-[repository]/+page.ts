import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { buildVerboseDomain } from '../../store';

export const load = async ({ parent, params, url }) => {
    const { installations, frameworks, project, organization, regionalConsoleVariables } =
        await parent();

    const repository = await sdk
        .forProject(params.region, params.project)
        .vcs.getRepository(url.searchParams.get('installation'), params.repository);

    const installation = installations.installations.find(
        (installation) => installation.$id === url.searchParams.get('installation')
    );

    const domain = await buildVerboseDomain(
        regionalConsoleVariables._APP_DOMAIN_SITES,
        repository.name,
        organization.name,
        project.name,
        ID.unique()
    );

    return {
        installations,
        installation,
        repository,
        frameworks,
        domain
    };
};
