import { browser } from '$app/env';
import { writable } from 'svelte/store';

export type AppStore = {
	theme: 'light' | 'dark';
};
export const app = writable<AppStore>({
	theme: 'light'
});

if (browser) {
	app.update((n) => ({
		...n,
		...(JSON.parse(localStorage.getItem('appwrite')) ?? {})
	}));
	app.subscribe((u) => localStorage.setItem('appwrite', JSON.stringify(u) ?? '{}'));
}
