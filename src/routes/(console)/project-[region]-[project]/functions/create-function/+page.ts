import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, url, params }) => {
    const [{ installations }, { templates }] = await Promise.all([
        parent(),
        sdk.forProject(params.region, params.project).functions.listTemplates({ limit: 100 })
    ]);

    return {
        installation: installations.installations.find(
            (installation) => installation.$id === url.searchParams.get('installation')
        ),
        templates: templates
    };
};
