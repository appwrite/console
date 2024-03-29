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
    import { page } from '$app/stores';

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
            label: 'Go to Auth',
            callback: () => {
                goto(`/console/project-${$project.$id}/auth`);
            },
            keys: ['g', 'a'],
            group: 'navigation'
        },
        {
            label: 'Go to Databases',
            callback: () => {
                goto(`/console/project-${$project.$id}/databases`);
            },
            keys: ['g', 'd'],
            group: 'navigation'
        },
        {
            label: 'Go to Functions',
            callback: () => {
                goto(`/console/project-${$project.$id}/functions`);
            },
            keys: ['g', 'f'],
            group: 'navigation'
        },
        {
            label: 'Go to Messaging',
            callback: () => {
                goto(`/console/project-${$project.$id}/messaging`);
            },
            keys: ['g', 'm'],
            disabled: $page.url.pathname.endsWith('messaging'),
            group: 'navigation'
        },
        {
            label: 'Go to Storage',
            callback: () => {
                goto(`/console/project-${$project.$id}/storage`);
            },
            keys: ['g', 's'],
            group: 'navigation'
        },
        {
            label: 'Go to Settings',
            callback: () => {
                goto(`/console/project-${$project.$id}/settings`);
            },
            keys: ['g', 'e'],
            group: 'navigation'
        },
        {
            label: 'Go to Overview',
            callback: () => {
                goto(`/console/project-${$project.$id}`);
            },
            keys: ['g', 'o'],
            group: 'navigation'
        }
    ]);

    $registerSearchers(userSearcher, teamSearcher, dbSearcher, functionsSearcher, bucketSearcher);
</script>

<slot />

<UploadBox />
<MigrationBox />
