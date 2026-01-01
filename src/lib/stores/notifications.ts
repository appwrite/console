import { writable } from 'svelte/store';
import type { ComponentType } from 'svelte';

export type Notification = {
    id: number;
    type?: 'success' | 'error' | 'info' | 'warning';
    dismissible?: boolean;
    timeout?: number;
    message: string;
    title?: string;
    icon?: ComponentType;
    buttons?: Buttons[];
    isHtml?: boolean;
};

export type Buttons = {
    method: () => void | Promise<void>;
    name: string;
    isHtml?: boolean;
};

let counter = 0;

const activeTimeouts = new Map<number, NodeJS.Timeout>();

export const notifications = writable<Notification[]>([]);

export const dismissNotification = (id: number) => {
    const timeoutId = activeTimeouts.get(id);

    if (timeoutId) {
        clearTimeout(timeoutId);
        activeTimeouts.delete(id);
    }

    notifications.update((all) => all.filter((t) => t.id !== id));
};

export const dismissAllNotifications = () => {
    activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    activeTimeouts.clear();

    notifications.set([]);
};

export const addNotification = (notification: Omit<Notification, 'id'>): number => {
    const defaults: Notification = {
        id: counter++,
        type: 'info',
        dismissible: true,
        timeout: 6000,
        ...notification
    };

    notifications.update((all) => [defaults, ...all.slice(0, 4)]);

    if (defaults.timeout) {
        const timeoutId = setTimeout(() => {
            activeTimeouts.delete(defaults.id);
            dismissNotification(defaults.id);
        }, defaults.timeout);

        activeTimeouts.set(defaults.id, timeoutId);
    }

    return defaults.id;
};
