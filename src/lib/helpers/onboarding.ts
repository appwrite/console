import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';

const userPreferences = () => get(user)?.prefs;

export function hasOnboardingDismissed(projectId: string) {
    const currentPrefs = userPreferences();
    const onboardingDismissed = currentPrefs?.onboardingDismissed;
    return (
        onboardingDismissed &&
        Array.isArray(onboardingDismissed) &&
        onboardingDismissed.includes(projectId)
    );
}

export async function setHasOnboardingDismissed(projectId: string) {
    const currentPrefs = userPreferences();
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
