import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import SpatialColumnsLight from '$lib/images/promos/spatial-columns-api-light.png';
import SpatialColumnsDark from '$lib/images/promos/spatial-columns-api-dark.png';
import InversionQueriesDark from '$lib/images/promos/inversion-queries-dark.png';
import InversionQueriesLight from '$lib/images/promos/inversion-queries-light.png';
import TransactionsApiDark from '$lib/images/promos/transactions-api-dark.png';
import TransactionsApiLight from '$lib/images/promos/transactions-api-light.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const spatialColumnsPromo: BottomModalAlertItem = {
        id: 'modal:spatial_columns_announcement',
        src: {
            dark: SpatialColumnsDark,
            light: SpatialColumnsLight
        },
        title: 'Announcing API for spatial columns',
        message: 'Store and query geo data directly in your database.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-spatial-columns',
            external: true,
            hideOnClick: true
        },
        show: true
    };

    const inversionQueriesPromo: BottomModalAlertItem = {
        id: 'modal:inversion_queries_announcement',
        src: {
            dark: InversionQueriesDark,
            light: InversionQueriesLight
        },
        title: 'Announcing inversion queries',
        message: 'New NOT operators to exclude data directly in queries.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-inversion-queries',
            external: true,
            hideOnClick: true
        },
        show: true
    };

    const transactionsApiPromo: BottomModalAlertItem = {
        id: 'modal:transactions_api_announcement',
        src: {
            dark: TransactionsApiDark,
            light: TransactionsApiLight
        },
        title: 'Announcing Transactions API',
        message: 'Ensure data consistency across tables with atomic, all-or-nothing commits.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-transactions-api',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    listOfPromotions.push(spatialColumnsPromo, inversionQueriesPromo, transactionsApiPromo);
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
