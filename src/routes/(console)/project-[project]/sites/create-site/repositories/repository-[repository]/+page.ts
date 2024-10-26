import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params, url }) => {
    const { installations } = await parent();

    const [repository, frameworks] = await Promise.all([
        sdk.forProject.vcs.getRepository(url.searchParams.get('installation'), params.repository),
        sdk.forProject.sites.listFrameworks()
    ]);

    return {
        installations,
        installation: installations.installations.find(
            (installation) => installation.$id === url.searchParams.get('installation')
        ),
        repository,
        frameworks
    };
};
