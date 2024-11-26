export const load = async ({ parent }) => {
    const { installations } = await parent();

    return {
        installations
    };
};
