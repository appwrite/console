import type { Models } from '@appwrite.io/console';
import type { BarSeriesOption } from 'echarts/charts';
import { derived, get, writable } from 'svelte/store';
import { regions } from '$lib/stores/organization';
import { page } from '$app/stores';

export const project = derived(
    page,
    ($page) => $page.data.project as Models.Project & { region?: string }
);

export const projectRegion = derived(project, ($project) => {
    const availableRegions = get(regions);
    // region is marked as nullable above.
    if (!availableRegions || !availableRegions.regions || !$project || !$project.region)
        return null;

    return availableRegions.regions.find((region) => {
        return $project.region === region.$id;
    });
});

export const onboarding = derived(
    project,
    ($project) => $project?.platforms?.length === 0 && $project?.keys?.length === 0
);

/**
 * Same as the `consoleVariables` but from project's respective region!
 */
export const regionalConsoleVariables = derived(
    page,
    ($page) =>
        ($page.data.regionalConsoleVariables ??
            $page.data.consoleVariables) as Models.ConsoleVariables
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
