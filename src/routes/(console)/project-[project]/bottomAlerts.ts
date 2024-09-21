import RolesSampleDark from '$lib/images/samples/roles-sample-dark.svg';
import RolesSampleLight from '$lib/images/samples/roles-sample-light.svg';
import BackupsSampleDark from '$lib/images/samples/backups-sample-dark.svg';
import BackupsSampleLight from '$lib/images/samples/backups-sample-light.svg';

import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';

const listOfPromotions: BottomModalAlertItem[] = [
    {
        id: 'memberRoles',
        src: {
            dark: RolesSampleDark,
            light: RolesSampleLight
        },
        title: 'Member roles now available',
        message:
            'Enhance your workflow and security by assigning roles to members. Try it now for free until Dec 2024.',

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
        title: 'Database backups are now available',
        message:
            'Protect your data and ensure quick recovery with our new backups. <br/><b>Try it now for free until Nov 2024</b>.',

        isHtml: true,
        importance: 10,

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