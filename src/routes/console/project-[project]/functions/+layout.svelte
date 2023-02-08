<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';

    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdkForConsole.client.subscribe('console', (response) => {
            if (response.events.includes('functions.*.deployments.*')) {
                invalidate(Dependencies.DEPLOYMENTS);
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });
</script>

<svelte:head>
    <title>Functions - Appwrite</title>
</svelte:head>

<slot />
