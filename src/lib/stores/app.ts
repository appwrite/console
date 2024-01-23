import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

export type AppStore = {
    theme: 'light' | 'dark' | 'auto';
    themeInUse: 'light' | 'dark';
};

const defaultValue = {
    theme: 'auto',
    themeInUse: 'light'
};

export const app = writable<AppStore>(getInitialValue());

export const iconPath = derived(app, ($app) => {
    return (name: string, type: 'color' | 'grayscale') => {
        return `/icons/${$app.themeInUse}/${type}/${name}.svg`;
    };
});

if (browser) {
    app.subscribe((u) => localStorage.setItem('appwrite', JSON.stringify(u) ?? '{}'));
}

function getInitialValue() {
    if (!browser) {
        return defaultValue;
    }
    const localStorageValue = JSON.parse(localStorage.getItem('appwrite')) || {};
    const value = { ...localStorageValue, ...defaultValue };
    if (value.theme === 'auto' && window.matchMedia) {
        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
        if (darkThemeMq.matches) {
            value.themeInUse = 'dark';
        } else {
            value.themeInUse = '';
        }
    }
    return value;
}
