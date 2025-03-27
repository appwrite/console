<script lang="ts">
    import { BackupRestoreBox, MigrationBox, UploadBox } from '$lib/components';
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
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import {
        canSeeBuckets,
        canSeeDatabases,
        canSeeFunctions,
        canSeeMessages,
        canWriteProjects,
        canWriteSites
    } from '$lib/stores/roles';
    import CsvImportBox from '$lib/components/csvImportBox.svelte';

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
                goto(`${base}/project-${$project.$id}/auth`);
            },
            keys: ['g', 'a'],
            group: 'navigation'
        },
        {
            label: 'Go to Databases',
            callback: () => {
                goto(`${base}/project-${$project.$id}/databases`);
            },
            keys: ['g', 'd'],
            group: 'navigation',
            disabled: !$canSeeDatabases
        },
        {
            label: 'Go to Functions',
            callback: () => {
                goto(`${base}/project-${$project.$id}/functions`);
            },
            keys: ['g', 'f'],
            group: 'navigation',
            disabled: !$canSeeFunctions
        },
        {
            label: 'Go to Messaging',
            callback: () => {
                goto(`${base}/project-${$project.$id}/messaging`);
            },
            keys: ['g', 'm'],
            disabled: $page.url.pathname.endsWith('messaging') || !$canSeeMessages,
            group: 'navigation'
        },
        {
            label: 'Go to Storage',
            callback: () => {
                goto(`${base}/project-${$project.$id}/storage`);
            },
            keys: ['g', 's'],
            group: 'navigation',
            disabled: !$canSeeBuckets
        },
        {
            label: 'Go to Settings',
            callback: () => {
                goto(`${base}/project-${$project.$id}/settings`);
            },
            keys: ['g', 'e'],
            group: 'navigation',
            disabled: !$canWriteProjects
        },
        {
            label: 'Go to Sites',
            callback: () => {
                goto(`${base}/project-${$project.$id}/sites`);
            },
            keys: ['g', 'i'],
            group: 'navigation',
            disabled: !$canWriteSites
        },
        {
            label: 'Go to Overview',
            callback: () => {
                goto(`${base}/project-${$project.$id}`);
            },
            keys: ['g', 'o'],
            group: 'navigation'
        }
    ]);

    $registerSearchers(userSearcher, teamSearcher, dbSearcher, functionsSearcher, bucketSearcher);
</script>

<slot />

<div class="layout-level-progress-bars">
    <UploadBox />
    <MigrationBox />
    <BackupRestoreBox />
    <CsvImportBox />
</div>

<style>
    .layout-level-progress-bars {
        gap: 1rem;
        z-index: 1;
        display: flex;
        flex-direction: column;

        right: 0;
        bottom: 0;
        position: fixed;
        padding: 1.5rem;
    }

    @media (max-width: 768px) {
        .layout-level-progress-bars {
            position: relative;
            align-items: center;
        }
    }
</style>
