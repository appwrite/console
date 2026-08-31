import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import NewConsolePromo from '$lib/images/promos/new-console.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const newConsolePromo: BottomModalAlertItem = {
        id: 'modal:new_console_announcement',
        src: {
            dark: NewConsolePromo,
            light: NewConsolePromo
        },
        title: 'Introducing the new Appwrite Console',
        message:
            'Rebuilt from the ground up using the power of TanStack Start. Faster, cleaner, and everything you’re working on comes with you.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Try it now',
            link: () =>
                'https://appwrite.io/?utm_source=old-console&utm_medium=promo_card&utm_campaign=new-console',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(newConsolePromo);
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
