import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import TablesApiLight from '$lib/images/promos/tables-api-light.png';
import TablesApiDark from '$lib/images/promos/tables-api-dark.png';
import TimestampOverridesDark from '$lib/images/promos/timestamp-overrides-dark.png';
import TimestampOverridesLight from '$lib/images/promos/timestamp-overrides-light.png';
import AppwriteGeneralAvailabiltyLight from '$lib/images/promos/appwrite-general-availability-light.png';
import AppwriteGeneralAvailabiltyDark from '$lib/images/promos/appwrite-general-availability-dark.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const tablesApiPromo: BottomModalAlertItem = {
        id: 'modal:tables_api_announcement',
        src: {
            dark: TablesApiDark,
            light: TablesApiLight
        },
        title: 'Announcing the new TablesDB UI and more!',
        message:
            'This is Appwrite Databases’ most significant update so far, introducing new terminology, a new UI, and a supporting TablesDB API.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://apwr.dev/E64A90f',
            external: true,
            hideOnClick: true
        },
        show: true
    };

    const timestampOverridesPromo: BottomModalAlertItem = {
        id: 'modal:timestamp_overrides_announcement',
        src: {
            dark: TimestampOverridesDark,
            light: TimestampOverridesLight
        },
        title: 'Announcing Timestamp Overrides',
        message:
            'Move historical data into Appwrite without losing context or disrupting chronological accuracy.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-timestamp-overrides',
            external: true,
            hideOnClick: true
        },
        show: true
    };

    const appwriteGeneralAvailabiltyPromo: BottomModalAlertItem = {
        id: 'modal:appwrite_general_availability_announcement',
        src: {
            dark: AppwriteGeneralAvailabiltyDark,
            light: AppwriteGeneralAvailabiltyLight
        },
        title: 'Now Generally Available',
        message: 'After 26 months of Appwrite Cloud, we are ready to remove the beta tag.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Learn more',
            link: () => 'https://apwr.dev/ygTXfxA',
            external: true,
            hideOnClick: true
        },
        show: true
    };

    listOfPromotions.push(tablesApiPromo, timestampOverridesPromo, appwriteGeneralAvailabiltyPromo);
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
