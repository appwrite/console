export const load = async ({ parent }) => {
    let { installations, runtimesList } = await parent();

    return {
        installations,
        runtimesList
    };
};
