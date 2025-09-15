import type { LayoutLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/settings/header.svelte';
import { base } from '$app/paths';

export const load: LayoutLoad = async ({ params }) => {
    return {
        header: Header,
        path: `${base}/embed/project-${params.region}-${params.project}/settings`
    };
};

