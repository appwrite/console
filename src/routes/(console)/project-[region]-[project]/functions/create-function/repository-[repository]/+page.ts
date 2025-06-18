import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params, url }) => {
    const { installations, runtimesList, specificationsList } = await parent();

    const repository = await sdk
        .forProject(params.region, params.project)
        .vcs.getRepository(url.searchParams.get('installation'), params.repository);

    const installation = installations.installations.find(
        (installation) => installation.$id === url.searchParams.get('installation')
    );

    return {
        installation,
        installations,
        repository,
        runtimesList,
        specificationsList
    };
};
