import { base } from '$app/paths';
import { Dependencies } from '$lib/constants';
import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';
import { sdk } from '$lib/stores/sdk';
import type { Account } from '$lib/stores/user';
import { isCloud } from '$lib/system';
import type { AppwriteException } from '@appwrite.io/console';
import '@appwrite.io/pink';
import '@appwrite.io/pink-icons';
import { redirect } from '@sveltejs/kit';
import 'tippy.js/dist/tippy.css';
import type { LayoutLoad } from './$types';
import { redirectTo } from './store';

export const ssr = false;

export const load: LayoutLoad = async ({ depends, url, route }) => {
    depends(Dependencies.ACCOUNT);

    const [account, error] = (await sdk.forConsole.account
        .get()
        .then((response) => [response, null])
        .catch((error) => [null, error])) as [Account, AppwriteException];

    if (url.searchParams.has('forceRedirect')) {
        redirectTo.set(url.searchParams.get('forceRedirect') || null);
        url.searchParams.delete('forceRedirect');
    }

    if (account) {
        return {
            account,
            organizations: isCloud
                ? await sdk.forConsole.organizations.list()
                : await sdk.forConsole.teams.list()
        };
    }

    const isPublicRoute = route.id?.startsWith('/(public)');
    if (!isPublicRoute) {
        url.searchParams.set('redirect', url.pathname);
    }

    if (error.type === 'user_more_factors_required') {
        if (url.pathname === `${base}/mfa`)
            return {
                mfaRequired: true
            };
        redirect(303, withParams(`${base}/mfa`, url.searchParams));
    }

    if (!isPublicRoute) {
        if (isCloud) {
            checkPricingRefAndRedirect(url.searchParams, true);
        }

        redirect(303, withParams(`${base}/login`, url.searchParams));
    }
};

function withParams(pathname: string, searchParams: URLSearchParams) {
    if (searchParams.size > 0) return `${pathname}?${searchParams.toString()}`;
    return pathname;
}
