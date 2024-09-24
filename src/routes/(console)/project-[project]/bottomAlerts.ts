import RolesSampleDark from '$lib/images/samples/roles-dark.png';
import RolesSampleLight from '$lib/images/samples/roles-light.png';
import BackupsSampleDark from '$lib/images/samples/backups-dark.png';
import BackupsSampleLight from '$lib/images/samples/backups-light.png';

import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';

const listOfPromotions: BottomModalAlertItem[] = [
    {
        id: 'memberRoles',
        src: {
            dark: RolesSampleDark,
            light: RolesSampleLight
        },
        title: 'Member roles now on Pro plans',
        message:
            'Enhance your workflow and security by assigning roles to members. <br/><b>Try it now for free until Dec 2024.</b>',

        isHtml: true,
        plan: 'pro',
        cta: {
            text: 'Try Now',
            link: 'https://appwrite.io'
        },
        learnMore: {
            link: 'https://appwrite.io/docs'
        }
    },

    {
        id: 'databaseBackups',
        src: {
            dark: BackupsSampleDark,
            light: BackupsSampleLight
        },
        title: 'Database backups now on Pro plans',
        message:
            'Protect your data and ensure quick recovery with our new backups. <br/><b>Try it now for free until Nov 2024</b>.',

        isHtml: true,
        importance: 10,
        plan: 'pro',
        cta: {
            text: 'Try Now',
            link: 'https://appwrite.io'
        },
        learnMore: {
            link: 'https://appwrite.io/docs'
        }
    }
];

export function addBottomModalAlerts() {
    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));
}
