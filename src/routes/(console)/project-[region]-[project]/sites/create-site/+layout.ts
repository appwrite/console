import { sdk } from '$lib/stores/sdk';

export const load = async () => {
    const [installations, frameworks] = await Promise.all([
        sdk.forProject(page.params.region, page.params.project).vcs.listInstallations(),
        sdk.forProject(page.params.region, page.params.project).sites.listFrameworks()
    ]);
    return {
        installations,
        frameworks
    };
};
