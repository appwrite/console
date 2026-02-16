import { sdk } from '$lib/stores/sdk';
import { normalizeFrameworkCommands } from '$lib/helpers/packageManager';

export const load = async ({ params }) => {
    const [installations, frameworks] = await Promise.all([
        sdk.forProject(params.region, params.project).vcs.listInstallations(),
        sdk.forProject(params.region, params.project).sites.listFrameworks()
    ]);
    normalizeFrameworkCommands(frameworks);
    return {
        installations,
        frameworks
    };
};
