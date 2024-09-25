import { base } from '$app/paths';
import RolesDark from '$lib/images/roles-dark.png';
import RolesLight from '$lib/images/roles-light.png';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';

const listOfPromotions: BottomModalAlertItem[] = [
    {
        id: 'memberRoles',
        src: {
            dark: RolesDark,
            light: RolesLight
        },
        title: 'Member roles now on Pro plans',
        message:
            'Enhance your workflow and security by assigning roles to members. <br/><b>Try it now for free until Dec 2024.</b>',

        isHtml: true,
        scope: 'organization',
        plan: 'pro',
        cta: {
            text: 'Try Now',
            link: ({ organization }) => `${base}/organization-${organization.$id}/members`
        },
        learnMore: {
            text: 'Learn More',
            link: () => 'https://appwrite.io/docs/advanced/platform/roles'
        }
    }
];

export function addBottomModalAlerts() {
    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));
}
