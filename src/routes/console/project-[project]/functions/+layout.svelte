<script lang="ts">
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';

    onMount(() => {
        let previousStatus = null;
        return sdk.forConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (previousStatus === message.payload.status) {
                return;
            }
            previousStatus = message.payload.status;
            if (message.events.includes('functions.*.deployments.*.create')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
            if (message.events.includes('functions.*.deployments.*.update')) {
                invalidate(Dependencies.DEPLOYMENTS);
                invalidate(Dependencies.FUNCTION);

                return;
            }
            if (message.events.includes('functions.*.deployments.*.delete')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
        });
    });
</script>

<svelte:head>
    <title>Functions - Appwrite</title>
</svelte:head>

<slot />
