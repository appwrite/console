import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import PresenceApi from '$lib/images/promos/presence-api.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const presenceApiPromo: BottomModalAlertItem = {
        id: 'modal:presence_api_announcement',
        src: {
            dark: PresenceApi,
            light: PresenceApi
        },
        title: 'Announcing the Presence API',
        message:
            'Track who is online, typing, and active in realtime with built-in channels, automatic expiry, and permission-aware subscriptions.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-presence-api',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(presenceApiPromo);
}

export function addBottomModalAlerts() {
    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));
}

// use this for time based promo handling
// noinspection JSUnusedGlobalSymbols
export function isPromoLive(
    date: string,
    time: string,
    timeZone: string = 'Europe/Paris'
): boolean {
    const now = new Date();
    const targetString = `${date}T${time}:00`;
    const target = new Date(new Date(targetString).toLocaleString('en-US', { timeZone }));

    return isSameDay(now, target) && now >= target;
}
