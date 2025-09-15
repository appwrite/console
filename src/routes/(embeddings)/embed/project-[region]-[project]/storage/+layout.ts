import type { LayoutLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/storage/header.svelte';
import { base } from '$app/paths';

export const load: LayoutLoad = async ({ parent, params }) => {
    const { project } = await parent();
    return {
        project,
        header: Header,
        path: `${base}/embed/project-${params.region}-${params.project}/storage`
    };
};
