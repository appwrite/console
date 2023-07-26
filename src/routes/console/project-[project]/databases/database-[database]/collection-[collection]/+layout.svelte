<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from './store';

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (
                response.events.includes('databases.*.collections.*.attributes.*') ||
                response.events.includes('databases.*.collections.*.indexes.*')
            ) {
                invalidate(Dependencies.COLLECTION);
            }
        });
    });
</script>

<svelte:head>
    <title>{$collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

<slot />
