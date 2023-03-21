import { writable } from 'svelte/store';

export type Notification = {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    dismissible?: boolean;
    timeout?: number;
    message: string;
    title?: string;
    buttons?: Buttons[];
};

export type Buttons = {
    method: () => void | Promise<void>;
    name: string;
};

let counter = 0;

export const notifications = writable<Notification[]>([]);

export const dismissNotification = (id: number) => {
    notifications.update((all) => all.filter((t) => t.id !== id));
};

export const addNotification = (notification: Omit<Notification, 'id'>) => {
    const defaults = {
        id: counter++,
        type: 'info',
        dismissible: true,
        timeout: 6000
    };

    const n = { ...defaults, ...notification };
    notifications.update((all) => {
        return [n, ...all.slice(0, 2)];
    });

    if (n.timeout) setTimeout(() => dismissNotification(n.id), n.timeout);
};
