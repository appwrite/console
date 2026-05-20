import { sdk } from '$lib/stores/sdk';
import { goto, invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { Submit, trackEvent } from '$lib/actions/analytics';
import { base } from '$app/paths';
import { uploader } from '$lib/stores/uploader';
import { stopImpersonation, readImpersonationTargetUserId } from '$lib/appwrite/impersonation';

export async function logout(redirect: boolean = true) {
    // Clear impersonation before deleting the real session so the server
    // sees the operator's session, not an impersonated one.
    if (readImpersonationTargetUserId()) {
        stopImpersonation();
    }
    await sdk.forConsole.account.deleteSession({ sessionId: 'current' });
    await invalidate(Dependencies.ACCOUNT);
    uploader.reset();
    trackEvent(Submit.AccountLogout);
    if (redirect) await goto(`${base}/login`);
}
