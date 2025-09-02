import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import TablesApiLight from '$lib/images/promos/tables-api-light.png';
import TablesApiDark from '$lib/images/promos/tables-api-dark.png';
import TimeHelperQueriesDark from '$lib/images/promos/time-helper-queries-dark.png';
import TimeHelperQueriesLight from '$lib/images/promos/time-helper-queries-light.png';
import OptInRelationDark from '$lib/images/promos/opt-relation-dark.png';
import OptInRelationLight from '$lib/images/promos/opt-relation-light.png';

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

    const timeHelperQueriesPromo: BottomModalAlertItem = {
        id: 'modal:time_helper_queries_announcement',
        src: {
            dark: TimeHelperQueriesDark,
            light: TimeHelperQueriesLight
        },
        title: 'Announcing Time helper queries',
        message: 'New before/after filters for simpler time-based queries.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-time-helper-queries',
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
            'Gain full control over which related rows to fetch and drastically reduce payload sizes.',
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
    listOfPromotions.push(timeHelperQueriesPromo, optInRelationPromo, tablesApiPromo);
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
