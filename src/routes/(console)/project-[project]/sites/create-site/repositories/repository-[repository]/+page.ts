import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params, url }) => {
    const { installations } = await parent();

    return {
        installations,
        installation: installations.installations.find(
            (installation) => installation.$id === url.searchParams.get('installation')
        ),
        repository: await sdk.forProject.vcs.getRepository(
            url.searchParams.get('installation'),
            params.repository
        )
    };
};
