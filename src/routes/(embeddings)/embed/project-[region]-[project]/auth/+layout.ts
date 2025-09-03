import type { LayoutLoad } from './$types';
import { sdk } from '$lib/stores/sdk';

export const load: LayoutLoad = async ({ params }) => {
    // Minimal layout data for embeds; no UI wrapping.
    const project = await sdk.forConsole.projects.get(params.project);
    return { project } as const;
};
