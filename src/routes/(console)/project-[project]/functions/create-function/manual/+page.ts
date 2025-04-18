export const load = async ({ parent }) => {
    const { installations, runtimesList, specificationsList } = await parent();

    return {
        installations,
        runtimesList,
        specificationsList
    };
};
