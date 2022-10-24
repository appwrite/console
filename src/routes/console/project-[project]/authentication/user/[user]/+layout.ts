import { get } from 'svelte/store';
import { user } from './store';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    const userId = params.user;
    const data = get(user);
    const promise = user.load(userId);

    if (data?.$id !== userId) {
        await promise;
    }

    return {
        title: 'asd',
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
