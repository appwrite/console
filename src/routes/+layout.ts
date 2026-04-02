import '@appwrite.io/pink-legacy';
import '@appwrite.io/pink-icons';
import 'tippy.js/dist/tippy.css';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import { redirectTo } from './store';
import { resolve } from '$app/paths';
import type { Account } from '$lib/stores/user';
import { AppwriteException, Platform } from '@appwrite.io/console';
import { isCloud } from '$lib/system';
import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';
import { getTeamOrOrganizationList } from '$lib/stores/organization';
import { makePlansMap } from '$lib/helpers/billing';
import { plansInfo as plansInfoStore } from '$lib/stores/billing';
import { isEmailVerificationRequiredError } from '$lib/helpers/emailVerification';

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
        try {
            const [plansInfo, organizations] = await Promise.all([
                getPlatformPlans(),
                getTeamOrOrganizationList()
            ]);

            plansInfoStore.set(plansInfo);

            return {
                plansInfo,
                account: account,
                organizations
            };
        } catch (error) {
            if (
                error instanceof AppwriteException &&
                isEmailVerificationRequiredError(error.type)
            ) {
                const verifyEmailUrl = resolve('/verify-email');

                if (url.pathname !== verifyEmailUrl) {
                    redirect(303, withParams(verifyEmailUrl, url.searchParams));
                }
            }

            throw error;
        }
    }

    const isPublicRoute = route.id?.startsWith('/(public)');
    if (!isPublicRoute) {
        url.searchParams.set('redirect', url.pathname);
    }

    if (error.type === 'user_more_factors_required') {
        const mfaUrl = resolve('/(authenticated)/mfa');

        if (url.pathname === mfaUrl)
            return {
                mfaRequired: true
            };
        redirect(303, withParams(mfaUrl, url.searchParams));
    }

    if (isEmailVerificationRequiredError(error.type)) {
        const verifyEmailUrl = resolve('/verify-email');

        if (url.pathname !== verifyEmailUrl) {
            redirect(303, withParams(verifyEmailUrl, url.searchParams));
        }
    }

    if (!isPublicRoute) {
        if (isCloud) {
            checkPricingRefAndRedirect(url.searchParams, true);
        }

        const loginUrl = resolve('/(public)/(guest)/login');
        redirect(303, withParams(loginUrl, url.searchParams));
    }
};

function withParams(pathname: string, searchParams: URLSearchParams) {
    if (searchParams.size > 0) return `${pathname}?${searchParams.toString()}`;
    return pathname;
}

async function getPlatformPlans() {
    if (!isCloud) return null;

    const plansArray = await sdk.forConsole.console.getPlans({
        platform: Platform.Appwrite
    });

    return makePlansMap(plansArray);
}
