import Init3KeysPromo from '$lib/images/promos/init3-keys.png';
import Init3SitesPromo from '$lib/images/promos/init3-sites.png';
import Init3FlutterPromo from '$lib/images/promos/init3-flutter.png';
import Init3ImagesPromo from '$lib/images/promos/init3-images.png';
import Init3TokensPromo from '$lib/images/promos/init3-tokens.png';

import {
    type BottomModalAlertItem,
    setMobileSingleAlertLayout,
    showBottomModalAlert
} from '$lib/stores/bottom-alerts';
import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';

const listOfPromotions: BottomModalAlertItem[] = [];

if (!isCloud) {
    const getSrc = (image: string) => {
        return {
            dark: image,
            light: image
        };
    };

    const sharedCTA = (url: string) => ({
        external: true,
        link: () => url,
        hideOnClick: true,
        text: 'Read the announcement'
    });

    const promos: BottomModalAlertItem[] = [
        {
            id: 'modal:init3_sites',
            src: getSrc(Init3SitesPromo),
            title: 'Announcing: Sites',
            message:
                'The open-source Vercel alternative. With Sites, you deploy and host your websites and web apps right inside Appwrite.',
            plan: 'free',
            importance: 8,
            scope: 'everywhere',
            cta: sharedCTA('https://apwr.dev/sites1'),

            // Day 1 = Monday 9 AM CET
            show: isPromoLive('2025-05-19', '09:00')
        },
        {
            id: 'modal:init3_flutter',
            src: getSrc(Init3FlutterPromo),
            title: 'Announcing: Hosting for Flutter Web',
            message: 'Deploy your Flutter web apps directly from Appwrite Sites.',
            plan: 'free',
            importance: 8,
            scope: 'everywhere',
            cta: sharedCTA('https://apwr.dev/sitesfl'),

            // Day 2 = Tuesday 3 PM CET
            show: isPromoLive('2025-05-20', '15:00')
        },
        {
            id: 'modal:init3_keys',
            src: getSrc(Init3KeysPromo),
            title: 'Announcing: Dev Keys',
            message:
                'A new Appwrite feature that lets you bypass rate limits during local development.',
            plan: 'free',
            importance: 8,
            scope: 'everywhere',
            cta: sharedCTA('https://apwr.dev/devkeys'),

            // Day 3 = Wednesday 3 PM CET
            show: isPromoLive('2025-05-21', '15:00')
        },
        {
            id: 'modal:init3_images',
            src: getSrc(Init3ImagesPromo),
            title: 'Announcing: New image formats',
            message:
                'We have added support for two new image formats in Appwrite Storage: HEIC and AVIF.',
            plan: 'free',
            importance: 8,
            scope: 'everywhere',
            cta: sharedCTA('https://apwr.dev/imagefo'),

            // Day 4 = Thursday 3 PM CET
            show: isPromoLive('2025-05-22', '15:00')
        },
        {
            id: 'modal:init3_file_tokens',
            src: getSrc(Init3TokensPromo),
            title: 'Announcing: File Tokens',
            message:
                'File tokens let you share files easily and securely, without modifying permissions or changing project access.',
            plan: 'free',
            importance: 8,
            scope: 'everywhere',
            cta: sharedCTA('https://apwr.dev/filet'),

            // Day 5 = Friday 3 PM CET
            show: isPromoLive('2025-05-23', '15:00')
        }
    ];

    const currentPromo = promos.find((promo) => promo.show);

    if (currentPromo) {
        listOfPromotions.push(currentPromo);

        setMobileSingleAlertLayout({
            title: currentPromo.title,
            message: currentPromo.message,
            enabled: true,
            cta: currentPromo.cta
        });
    }
}

export function addBottomModalAlerts() {
    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));
}

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
