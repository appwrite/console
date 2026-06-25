import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import PresencesApi from '$lib/images/promos/presences-api.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const presencesApiPromo: BottomModalAlertItem = {
        id: 'modal:presences_api_announcement',
        src: {
            dark: PresencesApi,
            light: PresencesApi
        },
        title: 'Announcing the Presences API',
        message:
            'Track who is online, typing, and active in realtime with built-in channels, automatic expiry, and permission-aware subscriptions.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-presences-api',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(presencesApiPromo);
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
