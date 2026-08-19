import type { Models } from '@appwrite.io/console';
import type { BarSeriesOption } from 'echarts/charts';
import { derived, get, writable } from 'svelte/store';
import { regions } from '$lib/stores/organization';
import { page } from '$app/stores';
import CursorIcon from './overview/components/CursorIcon.svelte';
import ClaudeIcon from './overview/components/ClaudeIcon.svelte';
import VSCodeIcon from './overview/components/VSCodeIcon.svelte';
import CodexIcon from './overview/components/CodexIcon.svelte';

export const project = derived(page, ($page) => $page.data.project as Models.Project);

export const projectRegion = derived(project, ($project) => {
    const availableRegions = get(regions);
    // region could be null or undefined in project.
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
 * Region-aware version of `consoleVariables`, scoped to the project's assigned region.
 *
 * Falls back to the default `consoleVariables` if regional data is unavailable, just `edge-case` things.
 */
export const regionalConsoleVariables = derived(
    page,
    ($page) =>
        ($page.data.regionalConsoleVariables ??
            $page.data.consoleVariables) as Models.ConsoleVariables
);

/**
 * Protocol based on regional console variables.
 */
export const regionalProtocol = derived(regionalConsoleVariables, ($vars) =>
    $vars?._APP_OPTIONS_FORCE_HTTPS === 'enabled' ? 'https://' : 'http://'
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

export const mcpTools = [
    {
        href: 'https://cursor.com/install-mcp?name=appwrite&config=eyJ1cmwiOiJodHRwczovL21jcC5hcHB3cml0ZS5pby8ifQ==',
        icon: CursorIcon,
        label: 'Cursor'
    },
    {
        href: 'https://appwrite.io/docs/tooling/ai/agents/claude-code',
        icon: ClaudeIcon,
        label: 'Claude Code'
    },
    {
        href: 'vscode:mcp/install?%7B%22name%22%3A%22appwrite%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fmcp.appwrite.io%2F%22%7D',
        icon: VSCodeIcon,
        label: 'VS Code'
    },
    {
        href: 'https://appwrite.io/docs/tooling/ai/agents/codex',
        icon: CodexIcon,
        label: 'Codex'
    }
];
