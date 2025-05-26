import { sdk } from '$lib/stores/sdk';

export const load = async ({ params }) => {
    const [installations, frameworks] = await Promise.all([
        sdk.forProject(params.region, params.project).vcs.listInstallations(),
        sdk.forProject(params.region, params.project).sites.listFrameworks()
    ]);
    return {
        installations,
        frameworks
    };
};
