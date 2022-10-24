<script lang="ts">
    import { browser } from '$app/environment';
    import { afterNavigate } from '$app/navigation';
    import { updateLayout } from '$lib/stores/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import { deploymentList } from './function/[function]/store';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';

    let loaded = false;

    if (browser) {
        sdkForConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (message.events.includes('functions.*.deployments.*.create')) {
                deploymentList.createDeployment(message.payload);

                return;
            }
            if (message.events.includes('functions.*.deployments.*.update')) {
                deploymentList.updateDeployment(message.payload);

                return;
            }
            if (message.events.includes('functions.*.deployments.*.delete')) {
                //TODO: add delete method

                return;
            }
        });
    }
    onMount(handle);
    afterNavigate(handle);

    function handle() {
        updateLayout({
            breadcrumb: Breadcrumbs,
            header: Header
        });
        loaded = true;
    }
</script>

<svelte:head>
    <title>Functions - Appwrite</title>
</svelte:head>

{#if loaded}
    <slot />
{/if}
