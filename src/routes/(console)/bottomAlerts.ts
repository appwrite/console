import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import InitPromo from '$lib/images/promos/init-2026.png';
import NewConsolePromo from '$lib/images/promos/new-console.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const initPromo: BottomModalAlertItem = {
        id: 'modal:init_2026_announcement',
        src: {
            dark: InitPromo,
            light: InitPromo
        },
        title: 'Init is happening August 31 - September 4',
        message:
            'Five days of product launches, live sessions, and community events. Claim your ticket to join.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Claim your ticket',
            link: () => 'https://new.appwrite.io/init',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(initPromo);
}

if (isCloud) {
    const newConsolePromo: BottomModalAlertItem = {
        id: 'modal:new_console_announcement',
        src: {
            dark: NewConsolePromo,
            light: NewConsolePromo
        },
        title: 'Introducing the new Appwrite Console',
        message:
            'Rebuilt from the ground up. Faster, cleaner, and everything you’re working on comes with you.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Try it now',
            link: () => 'https://cloud.appwrite.io/console?ref=old-console&source=promo_card',
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
