import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import DbOperatorsDark from '$lib/images/promos/db-operators-dark.png';
import DbOperatorsLight from '$lib/images/promos/db-operators-light.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const dbOperatorsPromo: BottomModalAlertItem = {
        id: 'modal:db_operators_announcement',
        src: {
            dark: DbOperatorsDark,
            light: DbOperatorsLight
        },
        title: 'Announcing DB operators',
        message: 'Update multiple fields without fetching the entire row.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-db-operators',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    listOfPromotions.push(dbOperatorsPromo);
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
