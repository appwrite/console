import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import AutoIncrementDark from '$lib/images/promos/auto-increment-dark.png';
import AutoIncrementLight from '$lib/images/promos/auto-increment-light.png';
import AtomicNumericOperationsDark from '$lib/images/promos/atomic-numeric-operations-dark.png';
import AtomicNumericOperationsLight from '$lib/images/promos/atomic-numeric-operations-light.png';
import AppwriteGeneralAvailabiltyLight from '$lib/images/promos/appwrite-general-availability-light.png';
import AppwriteGeneralAvailabiltyDark from '$lib/images/promos/appwrite-general-availability-dark.png';

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
        appwriteGeneralAvailabiltyPromo,
        atomicNumericOperationsPromo,
        autoIncrementPromo
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
