import { sdk } from '$lib/stores/sdk';

export const load = async () => {
    const installations = await sdk.forProject.vcs.listInstallations();

    return {
        installations
    };
};
