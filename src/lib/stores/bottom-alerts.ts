import { writable } from 'svelte/store';
import type { NotificationCoolOffOptions } from '$lib/helpers/notifications';
import type { Organization } from '$lib/stores/organization';
import type { Models } from '@appwrite.io/console';

type BottomModalAlertAction = {
    text: string;
    hideOnClick?: boolean;
    link: (ctx: { organization: Organization; project: Models.Project }) => string;
    external?: boolean;
};

/**
 * Special layout settings for mobile when exactly one alert is shown.
 *
 * Applied only if `enabled` is `true` and the number of visible alerts is exactly 1.
 *
 * Useful when you want to display the alert directly in the floating window,
 * without opening a separate modal.
 */
export type MobileSingleAlertLayoutConfig = {
    title: string;
    message: string;
    enabled: boolean;
    isHtml?: boolean;
    // because message is the text!
    cta: Omit<BottomModalAlertAction, 'text'>;
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
    scope: 'organization' | 'project' | 'everywhere';
    notificationHideOptions?: NotificationCoolOffOptions;
};

type BottomModalAlertState = {
    alerts: BottomModalAlertItem[];
    mobileSingleLayout?: MobileSingleAlertLayoutConfig;
};

export const bottomModalAlertsConfig = writable<BottomModalAlertState>({ alerts: [] });

export const hideAllModalAlerts = () => {
    bottomModalAlertsConfig.update((state) => ({
        ...state,
        alerts: state.alerts.map((t) => ({ ...t, show: false }))
    }));
};

export const setMobileSingleAlertLayout = (config: MobileSingleAlertLayoutConfig) => {
    bottomModalAlertsConfig.update((state) => ({
        ...state,
        mobileSingleLayout: config
    }));
};

export const dismissBottomModalAlert = (id: string) => {
    bottomModalAlertsConfig.update((state) => ({
        ...state,
        alerts: state.alerts.filter((t) => t.id !== id)
    }));
};

export const showBottomModalAlert = (notification: BottomModalAlertItem) => {
    const defaults: Partial<BottomModalAlertItem> = {
        show: true,
        importance: 5,
        isHtml: false,
        ...notification
    };

    bottomModalAlertsConfig.update((state) => {
        if (state.alerts.some((t) => t.id === notification.id)) return state;
        return {
            ...state,
            alerts: [...state.alerts, defaults as BottomModalAlertItem]
        };
    });
};
