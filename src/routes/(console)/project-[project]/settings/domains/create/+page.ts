export const load = async ({ url }) => {
    const domain = url.searchParams.get('domain');
    const $id = url.searchParams.get('$id');

    return { domain, $id };
};
