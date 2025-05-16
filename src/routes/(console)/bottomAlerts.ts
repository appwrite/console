import Init3Promo from '$lib/images/promo-init3.png';

import {
    type BottomModalAlertItem,
    setMobileSingleAlertLayout,
    showBottomModalAlert
} from '$lib/stores/bottom-alerts';
import { isCloud } from '$lib/system';

const listOfPromotions: BottomModalAlertItem[] = [];

if (!isCloud) {
    const title = 'Join Init 19-23 May';
    const message =
        'This release will change the way you build with Appwrite forever. Register for Init and join the giveaway.';

    const callToAction = {
        external: true,
        hideOnClick: true,
        text: 'Claim your ticket',
        link: () => 'https://apwr.dev/clcon'
    };

    listOfPromotions.push({
        id: 'modal:init3',
        src: {
            dark: Init3Promo,
            light: Init3Promo
        },
        title,
        message,
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: callToAction
    });

    // there's only one item.
    setMobileSingleAlertLayout({
        title,
        message,
        enabled: true,
        cta: callToAction
    });
}

export function addBottomModalAlerts() {
    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));
}
