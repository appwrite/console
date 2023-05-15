export function isMac(): boolean {
    console.log('isMac()', window.navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    return window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}
