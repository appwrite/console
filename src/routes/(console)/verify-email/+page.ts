import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { isEmailVerificationEnabled } from '$lib/helpers/emailVerification';

export const load: PageLoad = async ({ parent, depends, url }) => {
    const { account, consoleVariables } = await parent();

    const emailVerificationEnabled = isEmailVerificationEnabled(consoleVariables);

    if (!emailVerificationEnabled) {
        redirect(303, resolve('/'));
    }

    depends(Dependencies.ACCOUNT);

    const user = url.searchParams.get('userId') ?? null;
    const secret = url.searchParams.get('secret') ?? null;

    if (account && account.emailVerification === true) {
        redirect(303, resolve('/'));
    } else if (user && secret) {
        try {
            await sdk.forConsole.account.updateVerification({
                userId: user,
                secret
            });

            addNotification({
                type: 'success',
                message: 'Email has been verified',
                timeout: 10000 // 10 seconds max, because if succeeded, loads takes some time!
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            redirect(303, resolve('/'));
        }
    }
    return {};
};
