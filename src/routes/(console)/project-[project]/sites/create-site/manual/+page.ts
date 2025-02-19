export const load = async ({ parent }) => {
    const { frameworks } = await parent();

    return {
        frameworks
    };
};
