export const load = async ({ parent, url }) => {
    const { templatesList, installations, runtimesList } = await parent();

    return {
        installations,
        installation: installations.installations.find(
            (installation) => installation.$id === url.searchParams.get('installation')
        ),
        runtimesList,
        templatesList
    };
};
