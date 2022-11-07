<script lang="ts">
    import { execute } from './store';
    import Execute from './execute.svelte';
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

<slot />

<Execute selectedFunction={$execute} />
