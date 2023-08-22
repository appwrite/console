import { marketplace } from '$lib/stores/marketplace';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    return {
        template: marketplace.find((template) => template.id === params.template)
    };
};
