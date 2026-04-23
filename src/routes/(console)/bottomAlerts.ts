import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import WebhooksApi from '$lib/images/promos/webhooks-api.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const webhooksApiPromo: BottomModalAlertItem = {
        id: 'modal:webhooks_api_announcement',
        src: {
            dark: WebhooksApi,
            light: WebhooksApi
        },
        title: 'Announcing the Webhooks API',
        message: 'Manage webhooks programmatically with Server SDKs and API keys.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-webhooks-api',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(webhooksApiPromo);
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
