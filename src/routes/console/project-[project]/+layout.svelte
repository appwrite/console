<script lang="ts">
    import { UploadBox } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project, stats } from './store';
    import { registerCommand } from '$lib/helpers/commandCenter';
    import { goto } from '$app/navigation';

    onMount(async () => {
        return sdk.forConsole.client.subscribe(['project', 'console'], (response) => {
            if (response.events.includes('stats.connections')) {
                for (const [projectId, value] of Object.entries(response.payload)) {
                    stats.add(projectId, [new Date(response.timestamp).toISOString(), value]);
                }
            }
        });
    });

    $: $registerCommand([
        {
            label: 'Go to Overview',
            keys: ['g', 'o'],

            callback: () => {
                goto(`/console/project-${$project.$id}`);
            }
        },

        {
            label: 'Go to Auth',
            callback: () => {
                goto(`/console/project-${$project.$id}/auth`);
            },
            keys: ['g', 'a']
        },
        {
            label: 'Go to Databases',
            callback: () => {
                goto(`/console/project-${$project.$id}/databases`);
            },
            keys: ['g', 'd']
        },
        {
            label: 'Go to Functions',
            callback: () => {
                goto(`/console/project-${$project.$id}/functions`);
            },
            keys: ['g', 'f']
        },
        {
            label: 'Go to Storage',
            callback: () => {
                goto(`/console/project-${$project.$id}/storage`);
            },
            keys: ['g', 's']
        }
    ]);
</script>

<slot />

<UploadBox />
