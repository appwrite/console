<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { onDestroy, onMount } from 'svelte';
    import { collection } from './store';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';

    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
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

    $: $registerCommands([
        {
            label: 'Create Attribute',
            keys: ['c', 'a'],
            callback() {
                // no-op
            },
            icon: 'plus',
            group: 'attributes'
        }
    ]);

    $updateCommandGroupRanks((p) => ({
        ...p,
        attributes: 1000,
        documents: 900,
        collections: 800
    }));
</script>

<svelte:head>
    <title>{$collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

<slot />
