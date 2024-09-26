import { base } from '$app/paths';
import RolesDark from '$lib/images/roles-dark.png';
import RolesLight from '$lib/images/roles-light.png';
import BackupsDark from '$lib/images/backups/backups-empty-dark.svg';
import BackupsLight from '$lib/images/backups/backups-empty-light.svg';

import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';

const listOfPromotions: BottomModalAlertItem[] = [
    {
        id: 'memberRoles',
        src: {
            dark: RolesDark,
            light: RolesLight
        },
        title: 'Roles are available now',
        message:
            'Enhance your workflow and security by assigning roles to members. <br/><b>Try for free until Jan 1st 2025 on paid plans.</b>',

        isHtml: true,
        plan: 'pro',
        cta: {
            text: 'Try now',
            link: ({ organization }) => `${base}/organization-${organization.$id}/members`
        },
        learnMore: {
            text: 'Learn more',
            link: () => 'https://appwrite.io/docs/advanced/platform/roles'
        }
    },
    {
        id: 'databaseBackups',
        src: {
            dark: BackupsDark,
            light: BackupsLight
        },
        title: 'Database Backups are available now',
        message:
            'Protect your data and ensure quick recovery with our new backups.<br/><b>Try for free until Jan 1st 2025 on paid plans.</b>',

        isHtml: true,
        plan: 'pro',
        scope: 'project',
        cta: {
            text: 'Try now',
            link: ({ project }) => `${base}/project-${project.$id}/databases`
        },
        learnMore: {
            text: 'Learn more',
            link: () => 'https://appwrite.io/docs/advanced/platform/roles'
        }
    }
];

export function addBottomModalAlerts() {
    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));
}
