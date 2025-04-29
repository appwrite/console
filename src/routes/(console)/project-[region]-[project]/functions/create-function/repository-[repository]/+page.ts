import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params, url }) => {
    const { installations, runtimesList, specificationsList } = await parent();

    const [repository] = await Promise.all([
        sdk.forProject.vcs.getRepository(url.searchParams.get('installation'), params.repository)
    ]);

    return {
        installations,
        installation: installations.installations.find(
            (installation) => installation.$id === url.searchParams.get('installation')
        ),
        repository,
        runtimesList,
        specificationsList
    };
};
