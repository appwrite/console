import type { LayoutLoad } from './$types';
import { base } from '$app/paths';
import Header from '$routes/(console)/project-[region]-[project]/databases/header.svelte';

export const load: LayoutLoad = async ({ parent, params }) => {
    const { project } = await parent();
    return {
        project,
        header: Header,
        path: `${base}/embed/project-${params.region}-${params.project}/databases`
    };
};
