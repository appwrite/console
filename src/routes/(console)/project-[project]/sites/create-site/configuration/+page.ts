import { sdk } from '$lib/stores/sdk';

export const load = async ({ url, parent }) => {
    const { installations } = await parent();
    let template = null;
    if (url.searchParams.has('template')) {
        //Fetch the template
        template = await sdk.forProject.sites.getTemplate(url.searchParams.get('template'));
        console.log(template);
        template.frameworks = ['sveltekit', 'nextjs'];
    }

    return {
        template,
        installations
    };
};
