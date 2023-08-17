<script lang="ts">
    import { UploadBox } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project, stats } from './store';

    import { goto } from '$app/navigation';
    import { registerCommands, registerSearchers } from '$lib/commandCenter';

    import {
        bucketSearcher,
        dbSearcher,
        functionsSearcher,
        teamSearcher,
        userSearcher
    } from '$lib/commandCenter/searchers';
    import { MigrationBox } from '$lib/components';

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
        }
    ]);

    $registerSearchers(userSearcher, teamSearcher, dbSearcher, functionsSearcher, bucketSearcher);
</script>

<slot />

<UploadBox />
<MigrationBox />
