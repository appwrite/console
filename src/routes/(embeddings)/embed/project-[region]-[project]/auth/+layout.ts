import type { LayoutLoad } from './$types';
import { base } from '$app/paths';
import Header from '$routes/(console)/project-[region]-[project]/auth/header.svelte';

export const load: LayoutLoad = async ({ params }) => {
    return {
        header: Header,
        path: `${base}/embed/project-${params.region}-${params.project}/auth`
    };
};
