import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

export type AppStore = {
    theme: 'light' | 'dark' | 'auto';
    themeInUse: 'light' | 'dark';
};

export const app = writable<AppStore>({
    theme: 'auto',
    themeInUse: 'light'
});

export const iconPath = derived(app, ($app) => {
    return (name: string, type: 'color' | 'grayscale') => {
        return `/icons/${$app.themeInUse}/${type}/${name}.svg`;
    };
});

if (browser) {
    app.update((n) => ({
        ...n,
        ...(JSON.parse(localStorage.getItem('appwrite')) ?? {})
    }));
    app.subscribe((u) => localStorage.setItem('appwrite', JSON.stringify(u) ?? '{}'));
}
