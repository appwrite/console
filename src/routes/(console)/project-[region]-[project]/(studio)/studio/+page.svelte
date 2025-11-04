<script lang="ts">
    import { onDestroy, onMount, tick } from 'svelte';
    import {
        attachStudioTo,
        ensureStudioComponent,
        hideStudio,
        navigateToRoute
    } from '$lib/studio/studio-widget';
    import { page } from '$app/state';

    let anchor: HTMLElement = $state();

    function positionStudio() {
        if (!anchor) return;
        attachStudioTo(anchor, { offsetX: 0, offsetY: 0 });
    }

    onMount(async () => {
        ensureStudioComponent();
        await tick();
        positionStudio();
        navigateToRoute({
            id: 'project',
            props: {
                projectId: page.params.project,
                region: page.params.region
            }
        });
    });

    onDestroy(() => {
        hideStudio();
    });

    $effect(() => {
        positionStudio();
    });
</script>

<svelte:head>
    <title>Studio - Appwrite</title>
</svelte:head>

<div class="studio-page" bind:this={anchor}></div>

<style>
    .studio-page {
        position: relative;
        width: 100%;
        min-height: calc(100vh - 48px);
        background: var(--bgcolor-neutral-primary);
    }
</style>
