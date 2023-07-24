<script lang="ts">
    import { UploadBox } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project, stats } from './store';

    import { goto } from '$app/navigation';
    import { addSubPanel, registerCommands, registerSearchers } from '$lib/commandCenter';

    import { dbSearcher, userSearcher } from '$lib/commandCenter/searchers';
    import { MigrationBox } from '$lib/components';
    import {
        UsersPanel,
        TeamsPanel,
        DatabasesPanel,
        FunctionsPanel
    } from '$lib/commandCenter/panels';

    onMount(async () => {
        return sdk.forConsole.client.subscribe(['project', 'console'], (response) => {
            if (response.events.includes('stats.connections')) {
                for (const [projectId, value] of Object.entries(response.payload)) {
                    stats.add(projectId, [new Date(response.timestamp).toISOString(), value]);
                }
            }
        });
    });

    $: $registerCommands([
        {
            label: 'Go to Overview',
            callback: () => {
                goto(`/console/project-${$project.$id}`);
            },
            keys: ['o'],
            group: 'navigation'
        },

        {
            label: 'Go to Auth',
            callback: () => {
                goto(`/console/project-${$project.$id}/auth`);
            },
            keys: ['a'],
            group: 'navigation'
        },
        {
            label: 'Go to Databases',
            callback: () => {
                goto(`/console/project-${$project.$id}/databases`);
            },
            keys: ['d'],
            group: 'navigation'
        },
        {
            label: 'Go to Functions',
            callback: () => {
                goto(`/console/project-${$project.$id}/functions`);
            },
            keys: ['f'],
            group: 'navigation'
        },
        {
            label: 'Go to Storage',
            callback: () => {
                goto(`/console/project-${$project.$id}/storage`);
            },
            keys: ['s'],
            group: 'navigation'
        },
        {
            label: 'Go to Settings',
            callback: () => {
                goto(`/console/project-${$project.$id}/settings`);
            },
            keys: ['p'],
            group: 'navigation'
        },
        {
            label: 'Find Users',
            callback: () => {
                addSubPanel(UsersPanel);
            },
            group: 'users',
            icon: 'search',
            keys: ['f', 'u'],
            rank: 10
        },
        {
            label: 'Find Teams',
            callback: () => {
                addSubPanel(TeamsPanel);
            },
            group: 'teams',
            icon: 'search',
            keys: ['f', 't']
        },
        {
            label: 'Find Databases',
            callback: () => {
                addSubPanel(DatabasesPanel);
            },
            group: 'databases',
            icon: 'search',
            keys: ['f', 'd']
        },
        {
            label: 'Find Functions',
            callback: () => {
                addSubPanel(FunctionsPanel);
            },
            group: 'functions',
            icon: 'search',
            keys: ['f', 'f']
        }
    ]);

    $: $registerSearchers(userSearcher, dbSearcher);
</script>

<slot />

<UploadBox />
<MigrationBox />
