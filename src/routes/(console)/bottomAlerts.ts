import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import RelationshipsOutOfBeta from '$lib/images/promos/relationships-out-of-beta.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const relationshipsOutOfBetaPromo: BottomModalAlertItem = {
        id: 'modal:relationships_out_of_beta_announcement',
        src: {
            dark: RelationshipsOutOfBeta,
            light: RelationshipsOutOfBeta
        },
        title: 'Database relationships are out of beta',
        message:
            'After a year of performance overhauls, opt-in loading, and full query support, relationships are now production-ready.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/relationships-are-out-of-beta',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(relationshipsOutOfBetaPromo);
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
