import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import type { BarSeriesOption } from 'echarts/charts';
import { derived, writable } from 'svelte/store';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import RolesSampleDark from '$lib/images/samples/roles-sample-dark.svg';
import RolesSampleLight from '$lib/images/samples/roles-sample-light.svg';

import BackupsSampleDark from '$lib/images/samples/backups-sample-dark.svg';
import BackupsSampleLight from '$lib/images/samples/backups-sample-light.svg';

export const project = derived(
    page,
    ($page) => $page.data.project as Models.Project & { region?: string }
);
export const onboarding = derived(
    project,
    ($project) => $project?.platforms?.length === 0 && $project?.keys?.length === 0
);

function createStats() {
    const { subscribe, set, update } = writable<Map<string, BarSeriesOption['data']>>(new Map());

    return {
        subscribe,
        add: (projectId: string, data: BarSeriesOption['data'][number]) =>
            update((n) => {
                let series = n.get(projectId) ?? [];

                if (series.length === 0) {
                    const date = new Date(data[0]);
                    for (let i = 0; i < 12; i++) {
                        series.push([date.toISOString(), 0]);
                        date.setSeconds(date.getSeconds() - 5);
                    }
                }

                series.push(data);

                if (series.length > 12) {
                    series = series.slice(-12);
                }

                n.set(projectId, series);

                return n;
            }),
        reset: () => set(new Map())
    };
}

export const stats = createStats();

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
    listOfPromotions.forEach((promotion) => {
        showBottomModalAlert(promotion);
    });
}
