import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';

const userPreferences = () => get(user)?.prefs;

export function getChatWidthFromPrefs(): number {
    const currentPrefs = userPreferences();
    if (currentPrefs?.studioChatWidth) {
        if (window) {
            const maxSize = page.data?.subNavigation
                ? window.innerWidth - 660
                : window.innerWidth - 460;

            if (parseInt(currentPrefs.studioChatWidth) > maxSize) {
                return maxSize;
            }
        }
        return parseInt(currentPrefs.studioChatWidth);
    }
    return 500;
}
export function saveChatWidthToPrefs(position: number) {
    const currentPrefs = userPreferences();
    const newPrefs = {
        ...currentPrefs,
        studioChatWidth: position
    };

    sdk.forConsole.account.updatePrefs(newPrefs);
}

export function getTerminalHeightFromPrefs(): number {
    const currentPrefs = userPreferences();
    if (currentPrefs?.studioTerminalHeight) {
        if (window) {
            const maxSize = window.innerHeight - 400;

            if (parseInt(currentPrefs.studioTerminalHeight) > maxSize) {
                return maxSize;
            }
        }
        return parseInt(currentPrefs.studioTerminalHeight);
    }
    return 300;
}

export function saveTerminalHeightToPrefs(position: number) {
    const currentPrefs = userPreferences();

    const newPrefs = {
        ...currentPrefs,
        studioTerminalHeight: position
    };

    sdk.forConsole.account.updatePrefs(newPrefs);
}

export function getTerminalOpenFromPrefs(): boolean {
    const currentPrefs = userPreferences();
    return currentPrefs?.studioTerminalOpen as unknown as boolean;
}

export function saveTerminalOpenToPrefs(isOpen: boolean) {
    const currentPrefs = userPreferences();
    const newPrefs = {
        ...currentPrefs,
        studioTerminalOpen: isOpen
    };
    sdk.forConsole.account.updatePrefs(newPrefs);
}

export function disableBodySelect() {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
}
export function enabledBodySelect() {
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
}
