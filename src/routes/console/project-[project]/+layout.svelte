<script lang="ts">
    import { UploadBox } from '$lib/components';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import { onDestroy, onMount } from 'svelte';
    import { stats } from './store';

    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdkForConsole.client.subscribe(['project', 'console'], (response) => {
            if (response.events.includes('stats.connections')) {
                for (const [projectId, value] of Object.entries(response.payload)) {
                    stats.add(projectId, [new Date(response.timestamp).toISOString(), value]);
                }
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });
</script>

<slot />

<UploadBox />
