import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import type { BarSeriesOption } from 'echarts/charts';
import { ExtendCommandRegistrant } from '$lib/helpers/commandCenter';
import { goto } from '$app/navigation';

export const project = derived(page, ($page) => $page.data.project as Models.Project);

export const projectRegistrant = derived<
    typeof project,
    ReturnType<typeof ExtendCommandRegistrant>
>(project, ($project) => {
    return ExtendCommandRegistrant([
        {
            label: 'Go to Overview',
            keys: ['o'],
            callback: () => {
                goto(`/console/project-${$project.$id}`);
            }
        },

        {
            label: 'Go to Auth',
            callback: () => {
                goto(`/console/project-${$project.$id}/auth`);
            },
            keys: ['a']
        },
        {
            label: 'Go to Databases',
            callback: () => {
                goto(`/console/project-${$project.$id}/databases`);
            },
            keys: ['d']
        },
        {
            label: 'Go to Functions',
            callback: () => {
                goto(`/console/project-${$project.$id}/functions`);
            },
            keys: ['f']
        },
        {
            label: 'Go to Storage',
            callback: () => {
                goto(`/console/project-${$project.$id}/storage`);
            },
            keys: ['s']
        }
    ]);
});

export const onboarding = derived(
    project,
    ($project) => $project.platforms.length === 0 && $project.keys.length === 0
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
