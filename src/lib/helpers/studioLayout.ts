import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';

const userPreferences = () => get(user)?.prefs;

export function getChatWidthFromPrefs() {
    const currentPrefs = userPreferences();
    if ('studioChatWidth' in currentPrefs) {
        if (window) {
            const maxSize = page.data?.subNavigation
                ? window.innerWidth - 660
                : window.innerWidth - 460;

            if (parseInt(currentPrefs.studioChatWidth) > maxSize) {
                return maxSize;
            }
        }
        return currentPrefs.studioChatWidth;
    }
    return 500;
}
export function saveChatWidthToPrefs(position: number) {
    console.log({ position });
    const currentPrefs = userPreferences();

    const newPrefs = {
        ...currentPrefs,
        studioChatWidth: position
    };

    sdk.forConsole.account.updatePrefs(newPrefs);
}
//
