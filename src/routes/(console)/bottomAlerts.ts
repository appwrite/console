import { base } from '$app/paths';
import BackupsDark from '$lib/images/backups/promo/backups-dark.png';
import BackupsLight from '$lib/images/backups/promo/backups-light.png';

import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import { isCloud } from '$lib/system';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    listOfPromotions.push({
        id: 'modal:databaseBackups',
        src: {
            dark: BackupsDark,
            light: BackupsLight
        },
        title: 'Database Backups are available now',
        message: 'Protect your data and ensure quick recovery with our new backups',
        plan: 'pro',
        scope: 'project',
        importance: 8,
        cta: {
            text: 'Try now',
            link: ({ project }) => `${base}/project-${project.region}-${project.$id}/databases`
        },
        learnMore: {
            text: 'Learn more',
            link: () => 'http://appwrite.io/docs/products/databases/backups'
        }
    });
}

export function addBottomModalAlerts() {
    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));
}
