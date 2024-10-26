import { sdk } from '$lib/stores/sdk';

export const load = async () => {
    const [installations, frameworks] = await Promise.all([
        sdk.forProject.vcs.listInstallations(),
        sdk.forProject.sites.listFrameworks()
    ]);
    return {
        installations,
        frameworks
    };
};
