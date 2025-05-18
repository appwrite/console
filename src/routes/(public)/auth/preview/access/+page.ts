export const load = async ({ parent }) => {
    const { account } = await parent();

    return {
        account
    };
};
