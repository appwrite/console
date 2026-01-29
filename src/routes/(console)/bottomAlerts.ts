import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import Imagine from '$lib/components/promos/imagine.svelte';
import {
    type BottomModalAlertItem,
    setMobileSingleAlertLayout,
    showBottomModalAlert
} from '$lib/stores/bottom-alerts';

const SHOW_IMAGINE_PROMO = true;
import { ProfileMode, resolvedProfile } from '$lib/profiles/index.svelte';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud && SHOW_IMAGINE_PROMO) {
    const imaginePromo: BottomModalAlertItem = {
        id: 'modal:imagine-ph-launch-console',
        backgroundComponent: Imagine,
        title: 'Imagine is live on Product Hunt',
        message: 'Ask questions, share feedback, and support the launch',
        importance: 8,
        scope: 'everywhere',
        plan: 'free',
        cta: {
            text: 'Head to Product Hunt',
            color: {
                light: '#FFFFFF',
                dark: '#000000'
            },
            background: {
                light: '#000000',
                dark: '#FFFFFF'
            },
            backgroundHover: {
                light: '#333333',
                dark: '#CCCCCC'
            },
            link: () => 'https://apwr.dev/imagine-ph-appwrite-console',
            external: true,
            hideOnClick: true
        },
        show: false
    };

    listOfPromotions.push(imaginePromo);
}

export function addBottomModalAlerts() {
    // fast path: not the valid profile to show this!
    if (resolvedProfile.id !== ProfileMode.STUDIO) return;

    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));

    if (listOfPromotions.length > 0) {
        const promo = listOfPromotions[0];
        const { cta, title, message } = promo;
        setMobileSingleAlertLayout({ enabled: true, cta, title, message });
    }
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
