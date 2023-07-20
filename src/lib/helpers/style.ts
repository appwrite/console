type Direction = 'rtl' | 'ltr';

function isDirection(dir: string): dir is Direction {
    return dir === 'rtl' || dir === 'ltr';
}

function parseDirection(dir: string): Direction {
    return isDirection(dir) ? dir : 'ltr';
}

export function getElementDir(el: HTMLElement): Direction {
    if (window.getComputedStyle) {
        return parseDirection(window.getComputedStyle(el, null).getPropertyValue('direction'));
    }
    return parseDirection(el.style.direction);
}
