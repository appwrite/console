import { sdk } from '$lib/stores/sdk.js';
import { isCloud } from '$lib/system.js';
import type { Models } from '@appwrite.io/console';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load = async ({ parent, url, params }) => {
    //TODO: enable before release
    // if (!isCloud) redirect(303, '/');

    const { account } = await parent();

    if (!url.searchParams.has('type')) {
        error(404, 'Type is not optional');
    }

    const product = url.searchParams.get('type');
    let template: Models.TemplateFunction | Models.TemplateSite;

    switch (product) {
        case 'function':
            template = await sdk.forConsole.functions.getTemplate(params.template);
            break;
        case 'site':
            template = await sdk.forConsole.sites.getTemplate(params.template);
            break;
        default:
            error(404, 'Type is not valid');
    }

    if (account)
        return {
            account,
            template: template,
            product,
            organizations: account?.$id
                ? await sdk.forConsole.billing.listOrganization()
                : undefined
        };
};
