import { sdk } from '$lib/stores/sdk';

export const load = async ({ params }) => {
    const domain = await sdk.forProject.proxy.getRule(params.domain);
    return { domain };
};
