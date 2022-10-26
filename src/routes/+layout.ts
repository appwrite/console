import '@aw-labs/ui/src/_index.scss';
import 'tippy.js/dist/tippy.css';
import { sdkForConsole } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async ({ depends }) => {
    depends(Dependencies.ACCOUNT);
    try {
        const account = await sdkForConsole.account.get();

        return {
            account,
            organizations: sdkForConsole.teams.list()
        };
    } catch (error) {
        throw redirect(303, '/login');
    }
};
