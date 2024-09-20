import { writable } from 'svelte/store';
import type { NotificationCoolOffOptions } from '$lib/helpers/notifications';

export type BottomModalAlertItem = {
    id: string;
    src: string;
    title: string;
    message: string;
    cta: {
        text: string;
        link: string;
    };
    learnMore?: {
        text?: string;
        link?: string;
    };

    closed?: () => void;

    show?: boolean;
    isHtml?: boolean;
    importance?: number;

    notificationHideOptions?: NotificationCoolOffOptions;
};

export const bottomModalAlerts = writable<BottomModalAlertItem[]>([]);

export const dismissBottomModalAlert = (id: string) => {
    bottomModalAlerts.update((all) => all.filter((t) => t.id !== id));
};

export const showBottomModalAlert = (notification: BottomModalAlertItem) => {
    const defaults: Partial<BottomModalAlertItem> = {
        show: true,
        importance: 5,
        isHtml: false,
        ...notification
    };

    bottomModalAlerts.update((all) => {
        return [...all, defaults as BottomModalAlertItem];
    });
};
