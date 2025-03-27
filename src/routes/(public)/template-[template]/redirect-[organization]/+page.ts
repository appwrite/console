import { sdk } from '$lib/stores/sdk.js';

export const load = async ({ params, url }) => {
    // const { account } = await parent();
    const prefs = await sdk.forConsole.account.getPrefs();
    if (prefs.organization !== params.organization) {
        const newPrefs = { ...prefs, organization: params.organization };
        sdk.forConsole.account.updatePrefs(newPrefs);
    }
    return {
        organization: await sdk.forConsole.teams.get(params.organization),
        route: url.searchParams.get('route')
    };
};
