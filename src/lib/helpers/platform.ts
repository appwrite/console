import type { Models } from '@appwrite.io/console';

export type AnyPlatform =
    | Models.PlatformWeb
    | Models.PlatformApple
    | Models.PlatformAndroid
    | Models.PlatformWindows
    | Models.PlatformLinux;

export function isMac(): boolean {
    return window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export const getPlatformInfo = (platform: string) => {
    let name: string, icon: string;
    switch (platform) {
        case 'apple':
            name = 'Apple';
            icon = 'apple';
            break;
        case 'android':
            name = 'Android';
            icon = 'android';
            break;
        case 'web':
            name = 'Web';
            icon = 'code';
            break;
        case 'windows':
            name = 'Windows';
            icon = 'windows';
            break;
        case 'linux':
            name = 'Linux';
            icon = 'linux';
            break;
        default:
            name = 'Unknown';
            icon = 'unknown';
    }
    return { name, icon };
};

export function getPlatformIdentifier(platform: AnyPlatform): string {
    switch (platform.type) {
        case 'web':
            return (platform as Models.PlatformWeb).hostname;
        case 'android':
            return (platform as Models.PlatformAndroid).applicationId;
        case 'apple':
            return (platform as Models.PlatformApple).bundleIdentifier;
        case 'windows':
            return (platform as Models.PlatformWindows).packageIdentifierName;
        case 'linux':
            return (platform as Models.PlatformLinux).packageName;
        default:
            return '';
    }
}
