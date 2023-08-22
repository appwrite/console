<script lang="ts">
    import { UploadBox } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project, stats } from './store';

    import { goto } from '$app/navigation';
    import { addSubPanel, registerCommands, registerSearchers } from '$lib/commandCenter';

    import {
        BucketsPanel,
        DatabasesPanel,
        FunctionsPanel,
        TeamsPanel,
        UsersPanel
    } from '$lib/commandCenter/panels';
    import {
        bucketSearcher,
        dbSearcher,
        functionsSearcher,
        teamSearcher,
        userSearcher
    } from '$lib/commandCenter/searchers';
    import { MigrationBox } from '$lib/components';

    onMount(() => {
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
            label: 'Go to overview',
            callback: () => {
                goto(`/console/project-${$project.$id}`);
            },
            keys: ['o'],
            group: 'navigation'
        },

        {
            label: 'Go to auth',
            callback: () => {
                goto(`/console/project-${$project.$id}/auth`);
            },
            keys: ['a'],
            group: 'navigation'
        },
        {
            label: 'Go to databases',
            callback: () => {
                goto(`/console/project-${$project.$id}/databases`);
            },
            keys: ['d'],
            group: 'navigation'
        },
        {
            label: 'Go to functions',
            callback: () => {
                goto(`/console/project-${$project.$id}/functions`);
            },
            keys: ['f'],
            group: 'navigation'
        },
        {
            label: 'Go to storage',
            callback: () => {
                goto(`/console/project-${$project.$id}/storage`);
            },
            keys: ['s'],
            group: 'navigation'
        },
        {
            label: 'Go to settings',
            callback: () => {
                goto(`/console/project-${$project.$id}/settings`);
            },
            keys: ['p'],
            group: 'navigation'
        },
        {
            label: 'Find users',
            callback: () => {
                addSubPanel(UsersPanel);
            },
            group: 'users',
            icon: 'search',
            keys: ['f', 'u'],
            rank: 10
        },
        {
            label: 'Find teams',
            callback: () => {
                addSubPanel(TeamsPanel);
            },
            group: 'teams',
            icon: 'search',
            keys: ['f', 't']
        },
        {
            label: 'Find databases',
            callback: () => {
                addSubPanel(DatabasesPanel);
            },
            group: 'databases',
            icon: 'search',
            keys: ['f', 'd']
        },
        {
            label: 'Find functions',
            callback: () => {
                addSubPanel(FunctionsPanel);
            },
            group: 'functions',
            icon: 'search',
            keys: ['f', 'f']
        },
        {
            label: 'Find buckets',
            callback: () => {
                addSubPanel(BucketsPanel);
            },
            group: 'buckets',
            icon: 'search',
            keys: ['f', 'b']
        }
    ]);

    $registerSearchers(userSearcher, teamSearcher, dbSearcher, functionsSearcher, bucketSearcher);
</script>

<slot />

<UploadBox />
<MigrationBox />
