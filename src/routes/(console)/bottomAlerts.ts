import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import AutoIncrementDark from '$lib/images/promos/auto-increment-dark.png';
import AutoIncrementLight from '$lib/images/promos/auto-increment-light.png';
import EncryptedDatabasesDark from '$lib/images/promos/encrypted-attribute-dark.png';
import EncryptedDatabasesLight from '$lib/images/promos/encrypted-attribute-light.png';
import OptInRelationDark from '$lib/images/promos/opt-relation-dark.png';
import OptInRelationLight from '$lib/images/promos/opt-relation-light.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const encryptedAttributePromo: BottomModalAlertItem = {
        id: 'modal:encrypted_attribute_announcement',
        src: {
            dark: EncryptedDatabasesDark,
            light: EncryptedDatabasesLight
        },
        title: 'Introducing Encrypted string attribute support',
        message: 'Encrypt string attributes at rest, directly from the Appwrite Console.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-encrypted-string-attributes',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    const autoIncrementPromo: BottomModalAlertItem = {
        id: 'modal:auto_increment_announcement',
        src: {
            dark: AutoIncrementDark,
            light: AutoIncrementLight
        },
        title: 'Announcing Auto-increment support',
        message:
            'Get a built-in numeric identifier that increases predictably with every new document added.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-auto-increment-support',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    const optInRelationPromo: BottomModalAlertItem = {
        id: 'modal:opt_in_relation_announcement',
        src: {
            dark: OptInRelationDark,
            light: OptInRelationLight
        },
        title: 'Introducing Opt-in relationship loading',
        message:
            'Gain full control over which related documents to fetch and drastically reduce payload sizes.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-opt-in-relationship-loading',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    listOfPromotions.push(optInRelationPromo, autoIncrementPromo, encryptedAttributePromo);
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
