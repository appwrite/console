import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import TerraformProvider from '$lib/images/promos/terraform-provider.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const terraformProviderPromo: BottomModalAlertItem = {
        id: 'modal:terraform_provider_announcement',
        src: {
            dark: TerraformProvider,
            light: TerraformProvider
        },
        title: 'Introducing Terraform support for Appwrite projects',
        message:
            'Manage your entire Appwrite project as code with the official Terraform provider.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/introducing-terraform-provider-for-appwrite',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(terraformProviderPromo);
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
