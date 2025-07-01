import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import {
    type BottomModalAlertItem,
    showBottomModalAlert,
    setMobileSingleAlertLayout
} from '$lib/stores/bottom-alerts';

import CSVImportDark from '$lib/images/promos/csv-import-placeholder-dark.png';
import CSVImportLight from '$lib/images/promos/csv-import-placeholder-light.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const csvImportPromo: BottomModalAlertItem = {
        id: 'modal:csv_import_announcement',
        src: {
            dark: CSVImportDark,
            light: CSVImportLight
        },
        title: 'Introducing CSV import',
        message:
            "We're introducing a new way to populate your Appwrite databases: document imports from CSV files.",
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-csv-imports',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    if (csvImportPromo.show) {
        listOfPromotions.push(csvImportPromo);
        setMobileSingleAlertLayout({
            title: csvImportPromo.title,
            message: csvImportPromo.message,
            enabled: true,
            cta: {
                link: csvImportPromo.cta.link,
                external: csvImportPromo.cta.external
            }
        });
    }
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
