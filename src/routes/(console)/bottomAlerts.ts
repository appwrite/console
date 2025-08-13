import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import AtomicNumericOperationsDark from '$lib/images/promos/atomic-numeric-operations-dark.png';
import AtomicNumericOperationsLight from '$lib/images/promos/atomic-numeric-operations-light.png';
import AppwriteGeneralAvailabiltyLight from '$lib/images/promos/appwrite-general-availability-light.png';
import AppwriteGeneralAvailabiltyDark from '$lib/images/promos/appwrite-general-availability-dark.png';
import TablesApiLight from '$lib/images/promos/tables-api-light.png';
import TablesApiDark from '$lib/images/promos/tables-api-dark.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
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
    const tablesApiPromo: BottomModalAlertItem = {
        id: 'modal:tables_api_announcement',
        src: {
            dark: TablesApiDark,
            light: TablesApiLight
        },
        title: 'Announcing the new Grids UI and more!',
        message:
            'This is Appwrite Databases\u2019 most significant update so far, introducing new terminology, a new UI, and a supporting Grids API.',
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
    const atomicNumericOperationsPromo: BottomModalAlertItem = {
        id: 'modal:atomic_numeric_operations_announcement',
        src: {
            dark: AtomicNumericOperationsDark,
            light: AtomicNumericOperationsLight
        },
        title: 'Announcing Atomic Numeric Operations',
        message:
            'Safely update numeric fields directly on the server, without conflicts or race conditions.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-atomic-numeric-operations',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    listOfPromotions.push(
        tablesApiPromo,
        appwriteGeneralAvailabiltyPromo,
        atomicNumericOperationsPromo
    );
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
