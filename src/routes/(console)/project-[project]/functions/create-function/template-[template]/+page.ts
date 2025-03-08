import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params }) => {
    let { installations, runtimesList } = await parent();
    const template = await sdk.forProject.functions.getTemplate(params.template);

    return {
        installations,
        template,
        runtimesList
    };
};
