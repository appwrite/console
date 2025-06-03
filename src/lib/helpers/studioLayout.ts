import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';

const userPreferences = () => get(user)?.prefs;

const getImaginePrefs = () => {
    const currentPrefs = userPreferences();
    return currentPrefs?.imagine;
};

export function getChatWidthFromPrefs(): number {
    const imaginePrefs = getImaginePrefs();
    if (imaginePrefs?.studioChatWidth) {
        if (window) {
            const maxSize = page.data?.subNavigation
                ? window.innerWidth - 660
                : window.innerWidth - 460;

            if (parseInt(imaginePrefs.studioChatWidth) > maxSize) {
                return maxSize;
            }
        }
        return parseInt(imaginePrefs.studioChatWidth);
    }
    return 500;
}

export function getTerminalHeightFromPrefs(): number {
    const imaginePrefs = getImaginePrefs();
    if (imaginePrefs?.studioTerminalHeight) {
        if (window) {
            const maxSize = window.innerHeight - 400;

            if (parseInt(imaginePrefs.studioTerminalHeight) > maxSize) {
                return maxSize;
            }
        }
        return parseInt(imaginePrefs.studioTerminalHeight);
    }
    return 350;
}

export function getStudioView() {
    const imaginePrefs = getImaginePrefs();
    return imaginePrefs?.studioView as 'editor' | 'preview' | null;
}

export function saveImaginePrefs(key: string, value: string | number | boolean): void {
    const currentPrefs = userPreferences();
    const imaginePrefs = getImaginePrefs();

    const newPrefs = {
        ...currentPrefs,
        imagine: {
            ...imaginePrefs,
            [key]: value
        }
    };

    sdk.forConsole.account.updatePrefs(newPrefs);
}

export function getTerminalOpenFromPrefs(): boolean {
    const imaginePrefs = getImaginePrefs();
    return imaginePrefs?.studioTerminalOpen as unknown as boolean;
}

export function disableBodySelect(direction: 'row' | 'column' = 'column') {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    if (direction === 'row') {
        document.body.style.cursor = 'row-resize';
    } else {
        document.body.style.cursor = 'col-resize';
    }
}
export function enabledBodySelect() {
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.cursor = 'auto';
}
