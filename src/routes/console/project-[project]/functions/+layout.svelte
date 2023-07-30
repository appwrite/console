<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import LL from '$i18n/i18n-svelte';

    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
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
    <title>{$LL.console.project.title.functions()} - Appwrite</title>
</svelte:head>

<slot />
