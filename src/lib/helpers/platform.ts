export function isMac(): boolean {
    return window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export const getPlatformInfo = (platform: string) => {
    let name: string, icon: string;
    if (platform.includes('flutter')) {
        name = 'Flutter';
        icon = 'flutter';
    } else if (platform.includes('react-native')) {
        name = 'React Native';
        icon = 'react-native';
    } else if (platform.includes('apple')) {
        name = 'Apple';
        icon = 'apple';
    } else if (platform.includes('android')) {
        name = 'Android';
        icon = 'android';
    } else if (platform.includes('unity')) {
        name = 'Unity';
        icon = 'unity';
    } else if (platform.includes('web')) {
        name = 'Web';
        icon = 'code';
    } else {
        name = 'Unknown';
        icon = 'unknown';
    }
    return { name, icon };
};
