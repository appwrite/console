import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import {
    type BottomModalAlertItem,
    showBottomModalAlert,
    setMobileSingleAlertLayout
} from '$lib/stores/bottom-alerts';

import BulkApiDark from '$lib/images/promos/bulk-api-dark.png';
import BulkApiLight from '$lib/images/promos/bulk-api-light.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const bulkApiPromo: BottomModalAlertItem = {
        id: 'modal:bulk_api_announcement',
        src: {
            dark: BulkApiDark,
            light: BulkApiLight
        },
        title: 'Introducing Bulk API',
        message:
            'A new Appwrite Databases feature, explicitly designed to handle heavy write workloads.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-bulk-api',
            external: true,
            hideOnClick: true
        },
        show: true
    };

    listOfPromotions.push(bulkApiPromo);

    setMobileSingleAlertLayout({
        title: bulkApiPromo.title,
        message: bulkApiPromo.message,
        enabled: true,
        cta: {
            link: bulkApiPromo.cta.link,
            external: bulkApiPromo.cta.external,
            hideOnClick: bulkApiPromo.cta.hideOnClick
        }
    });
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
