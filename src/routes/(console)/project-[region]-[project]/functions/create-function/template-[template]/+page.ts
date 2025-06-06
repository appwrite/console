import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params }) => {
    const { installations, runtimesList, specificationsList } = await parent();
    const template = await sdk
        .forProject(params.region, params.project)
        .functions.getTemplate(params.template);

    return {
        installations,
        template,
        runtimesList,
        specificationsList
    };
};
