<script lang="ts">
    import { browser } from '$app/environment';
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import { deploymentList } from './function/[function]/store';

    let loaded = false;

    if (browser) {
        sdkForConsole.client.subscribe<Models.Deployment>('console', (message) => {
            console.log(message);

            if (message.events.includes('functions.*.deployments.*.update')) {
                deploymentList.updateDeployment(<Models.Deployment>message.payload);

                return;
            }
        });
    }
    onMount(handle);
    afterNavigate(handle);

    function handle(event = null) {
        updateLayout({
            navigate: event,
            title: 'Functions',
            level: 3,
            breadcrumbs: {
                href: 'functions',
                title: 'Functions'
            }
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Functions</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
