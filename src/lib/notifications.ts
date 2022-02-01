import { writable } from 'svelte/store';

export type Notification = {
	id: number;
	type: 'success' | 'error' | 'info';
	dismissible: boolean;
	timeout: number;
	message: string;
};

let counter = 0;

export const toasts = writable<Notification[]>([]);

export const dismissToast = (id: number) => {
	toasts.update((all) => all.filter((t) => t.id !== id));
};

export const addToast = (notification: Omit<Notification, 'id'>) => {
	const defaults = {
		id: counter++,
		type: 'info',
		dismissible: true,
		timeout: 3000
	};

	const n = { ...defaults, ...notification };
	toasts.update((all) => [n, ...all]);

	if (n.timeout) setTimeout(() => dismissToast(n.id), n.timeout);
};
