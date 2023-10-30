import '@appwrite.io/pink';
import '@appwrite.io/pink-icons';
import 'tippy.js/dist/tippy.css';
import LogRocket from 'logrocket';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async ({ depends, url }) => {
    depends(Dependencies.ACCOUNT);

    try {
        const account = await sdk.forConsole.account.get();

        LogRocket.identify(account.$id, {
            name: account.name,
            email: account.email
        });

        return {
            account,
            organizations: sdk.forConsole.teams.list()
        };
    } catch (error) {
        const acceptedRoutes = [
            '/login',
            '/register',
            '/recover',
            '/invite',
            '/auth/magic-url',
            '/auth/oauth2/success',
            '/auth/oauth2/failure',
            '/card',
            '/hackathon'
        ];

        if (!acceptedRoutes.some((n) => url.pathname.startsWith(n))) {
            const redirectUrl = `${url.search}&redirect=${url.pathname}`;
            throw redirect(303, `/login${redirectUrl}`);
        }
    }
};
