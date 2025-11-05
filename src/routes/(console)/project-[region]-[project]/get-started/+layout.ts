import Breadcrumbs from '../overview/breadcrumbs.svelte';
import Header from '../overview/header.svelte';
import type { LayoutLoad } from './$types';
import { resolvedProfile } from '$lib/profiles/index.svelte';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: LayoutLoad = async ({ params }) => {
    if (resolvedProfile.id !== 'console') {
        redirect(303, resolve('/(console)/project-[region]-[project]/(studio)', {
            region: params.region,
            project: params.project
        }))
    }

    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
