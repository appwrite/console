import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';

import BulkApiDark from '$lib/images/promos/bulk-api-dark.png';
import BulkApiLight from '$lib/images/promos/bulk-api-light.png';

import CSVImportDark from '$lib/images/promos/csv-import-placeholder-dark.png';
import CSVImportLight from '$lib/images/promos/csv-import-placeholder-light.png';
import DatabaseUpsertDark from '$lib/images/promos/database-upsert-dark.png';
import DatabaseUpsertLight from '$lib/images/promos/database-upsert-light.png';

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

    const bulkApiPromo: BottomModalAlertItem = {
        id: 'modal:bulk_api_announcement',
        src: {
            dark: BulkApiDark,
            light: BulkApiLight
        },
        title: 'Introducing Bulk API',
        message:
            'A new Appwrite Databases feature, explicitly designed to handle heavy write workloads.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-bulk-api',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    const databaseUpsert: BottomModalAlertItem = {
        id: 'modal:database_upsert_announcement',
        src: {
            dark: DatabaseUpsertDark,
            light: DatabaseUpsertLight
        },
        title: 'Introducing Database Upsert',
        message: 'A new Appwrite Database feature, built to simplify your database interactions.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-database-upsert',
            external: true,
            hideOnClick: true
        },
        show: true
    };

    listOfPromotions.push(bulkApiPromo, csvImportPromo, databaseUpsert);
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
