import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params }) => {
    const { frameworks } = await parent();

    return {
        frameworks,
        template: await sdk
            .forProject(params.region, params.project)
            .sites.getTemplate('starter-for-js')
    };
};
