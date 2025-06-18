import { sdk } from '$lib/stores/sdk';
import type { Account } from '$lib/stores/user';

export function hasOnboardingDismissed(projectId: string, account?: Account) {
    const currentPrefs = account?.prefs;
    const onboardingDismissed = currentPrefs?.onboardingDismissed;
    return (
        onboardingDismissed &&
        Array.isArray(onboardingDismissed) &&
        onboardingDismissed.includes(projectId)
    );
}

export async function setHasOnboardingDismissed(projectId: string, account?: Account) {
    const currentPrefs = account?.prefs;
    const onboardingDismissed = Array.isArray(currentPrefs?.onboardingDismissed)
        ? currentPrefs.onboardingDismissed
        : [];

    if (!onboardingDismissed.includes(projectId)) {
        onboardingDismissed.push(projectId);
    }

    const newPrefs = {
        ...currentPrefs,
        onboardingDismissed: onboardingDismissed
    };

    await sdk.forConsole.account.updatePrefs(newPrefs);
}
