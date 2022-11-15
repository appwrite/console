import '@aw-labs/ui/src/_index.scss';
import 'tippy.js/dist/tippy.css';
import { sdkForConsole } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async ({ depends, url }) => {
    if (url.pathname.startsWith('/auth')) {
        return;
    }
    depends(Dependencies.ACCOUNT);
    try {
        const account = await sdkForConsole.account.get();

        return {
            account,
            organizations: sdkForConsole.teams.list()
        };
    } catch (error) {
        const acceptedRoutes = ['/login', '/register', '/recover', '/invite'];

        if (!acceptedRoutes.includes(url.pathname)) {
            throw redirect(303, '/login');
        }
    }
};
