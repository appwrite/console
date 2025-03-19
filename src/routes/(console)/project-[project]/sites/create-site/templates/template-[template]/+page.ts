import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params }) => {
    const { installations, frameworks } = await parent();
    const template = await sdk.forProject.sites.getTemplate(params.template);

    return {
        installations,
        frameworks,
        template
    };
};
