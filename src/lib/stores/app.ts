import { browser } from '$app/env';
import { writable } from 'svelte/store';

export type AppStore = {
    theme: 'light' | 'dark' | 'auto';
};
export const app = writable<AppStore>({
    theme: 'auto'
});

if (browser) {
    app.update((n) => ({
        ...n,
        ...(JSON.parse(localStorage.getItem('appwrite')) ?? {})
    }));
    app.subscribe((u) => localStorage.setItem('appwrite', JSON.stringify(u) ?? '{}'));
}
