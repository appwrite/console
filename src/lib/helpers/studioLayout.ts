import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';

const userPreferences = () => get(user)?.prefs;

type ProjectPrefs = {
    studioView?: 'editor' | 'preview';
    studioChatWidth?: string;
    studioTerminalHeight?: string;
    studioTerminalOpen?: boolean;
};

type ImaginePrefs = {
    [projectId: string]: ProjectPrefs;
};

const getProjectPrefs = (projectId: string): ProjectPrefs => {
    const currentPrefs = userPreferences();
    const imaginePrefs = currentPrefs?.imagine;
    const projectPrefs = imaginePrefs?.[projectId] ?? ({} as ProjectPrefs);

    return projectPrefs;
};

export function getChatWidthFromPrefs(projectId: string): number {
    const projectPrefs = getProjectPrefs(projectId);

    if (projectPrefs?.studioChatWidth) {
        if (window) {
            const maxSize = page.data?.subNavigation
                ? window.innerWidth - 660
                : window.innerWidth - 460;

            if (parseInt(projectPrefs.studioChatWidth) > maxSize) {
                return maxSize;
            }
        }
        return parseInt(projectPrefs.studioChatWidth);
    }
    return 500;
}

export function getTerminalHeightFromPrefs(projectId: string): number {
    const projectPrefs = getProjectPrefs(projectId);
    if (projectPrefs?.studioTerminalHeight) {
        if (window) {
            const maxSize = window.innerHeight - 400;

            if (parseInt(projectPrefs.studioTerminalHeight) > maxSize) {
                return maxSize;
            }
        }
        return parseInt(projectPrefs.studioTerminalHeight);
    }
    return 350;
}

export function getStudioView(projectId: string) {
    const projectPrefs = getProjectPrefs(projectId);
    return projectPrefs?.studioView as 'editor' | 'preview' | null;
}

export const saveHasSurveyed = () => {
    const currentPrefs = userPreferences();
    const updatedPrefs = {
        ...currentPrefs,
        hasSurveyed: true
    };

    sdk.forConsole.account.updatePrefs(updatedPrefs);
};

export function saveImagineProjectPrefs(
    projectId: string,
    key: string,
    value: string | number | boolean
): void {
    const currentPrefs = userPreferences();
    const imaginePrefs = currentPrefs?.imagine as unknown as ImaginePrefs;
    const projectPrefs = getProjectPrefs(projectId);

    const newPrefs = {
        ...currentPrefs,
        imagine: {
            ...imaginePrefs,
            [projectId]: {
                ...projectPrefs,
                [key]: value
            }
        }
    };

    sdk.forConsole.account.updatePrefs(newPrefs);
}

export function getTerminalOpenFromPrefs(projectId: string): boolean {
    const projectPrefs = getProjectPrefs(projectId);
    return projectPrefs?.studioTerminalOpen as unknown as boolean;
}

export const getHasSurveyedFromPrefs = () => {
    const currentPrefs = userPreferences();
    return !!currentPrefs?.hasSurveyed || false;
};

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
