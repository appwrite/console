import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params }) => {
    const { installations } = await parent();
    let template = await sdk.forProject.sites.getTemplate(params.template);
    console.log(template);
    template.frameworks = ['sveltekit', 'nextjs'];

    return {
        installations,
        template
    };
};
