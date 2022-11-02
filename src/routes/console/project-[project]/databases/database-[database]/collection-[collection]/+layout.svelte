<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onDestroy, onMount } from 'svelte';
    import { collection } from './store';

    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdkForConsole.client.subscribe('console', (response) => {
            if (
                response.events.includes('databases.*.collections.*.attributes.*') ||
                response.events.includes('databases.*.collections.*.indexes.*')
            ) {
                invalidate(Dependencies.COLLECTION);
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
    <title>{$collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

<slot />
