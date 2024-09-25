import { writable } from 'svelte/store';
import type { NotificationCoolOffOptions } from '$lib/helpers/notifications';
import type { Organization } from '$lib/stores/organization';
import type { Models } from '@appwrite.io/console';

type BottomModalAlertAction = {
    text: string;
    link: (ctx: { organization: Organization; project: Models.Project }) => string;
};

export type BottomModalAlertItem = {
    id: string;
    title: string;
    message: string;

    src: Record<'dark' | 'light', string>;
    cta: BottomModalAlertAction;
    learnMore?: BottomModalAlertAction;
    plan: 'free' | 'pro' | 'scale' /*| 'enterprise'*/;
    show?: boolean;
    isHtml?: boolean;
    importance?: number;

    closed?: () => void;
    notificationHideOptions?: NotificationCoolOffOptions;
};

export const bottomModalAlerts = writable<BottomModalAlertItem[]>([]);

export const hideAllModalAlerts = () => {
    bottomModalAlerts.update((all) => all.map((t) => ({ ...t, show: false })));
};

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
