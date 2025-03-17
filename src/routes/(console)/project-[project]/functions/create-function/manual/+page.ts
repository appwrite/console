export const load = async ({ parent }) => {
    let { installations, runtimesList, specificationsList } = await parent();

    return {
        installations,
        runtimesList,
        specificationsList
    };
};
