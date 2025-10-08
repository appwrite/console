import '@appwrite.io/pink-legacy';
import '@appwrite.io/pink-icons';
import 'tippy.js/dist/tippy.css';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import { redirectTo } from './store';
import { base, resolve } from '$app/paths';
import type { Account } from '$lib/stores/user';
import type { AppwriteException } from '@appwrite.io/console';
import { isCloud, VARS } from '$lib/system';
import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';

export const ssr = false;

export const load: LayoutLoad = async ({ depends, url, route }) => {
    depends(Dependencies.ACCOUNT);
    depends(Dependencies.ORGANIZATIONS);

    const [account, error] = (await sdk.forConsole.account
        .get()
        .then((response) => [response, null])
        .catch((error) => [null, error])) as [Account, AppwriteException];

    if (url.searchParams.has('forceRedirect')) {
        redirectTo.set(url.searchParams.get('forceRedirect') || null);
        url.searchParams.delete('forceRedirect');
    }

    if (account) {
        if (isCloud && !account.emailVerification && VARS.EMAIL_VERIFICATION) {
            const isConsoleRoute = route.id?.startsWith('/(console)');
            const isVerifyEmailPage = url.pathname === resolve('/verify-email');

            if (isConsoleRoute && !isVerifyEmailPage) {
                redirect(303, resolve('/verify-email'));
            }
        }

        return {
            account: account,
            organizations: !isCloud
                ? await sdk.forConsole.teams.list()
                : await sdk.forConsole.billing.listOrganization()
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
