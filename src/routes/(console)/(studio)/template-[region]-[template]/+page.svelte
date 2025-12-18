<script lang="ts">
    import { onDestroy, onMount, tick } from 'svelte';
    import {
        attachStudioTo,
        ensureStudioComponent,
        hideStudio,
        navigateToRoute
    } from '$lib/studio/studio-widget';
    import { resolvedProfile } from '$lib/profiles/index.svelte';

    let { params } = $props();
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
            id: 'view',
            props: {
                projectId: params.template,
                region: params.region
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
    <title>Template - {resolvedProfile.platform}</title>
</svelte:head>

<div class="studio-page" bind:this={anchor}></div>

<style>
    .studio-page {
        position: relative;
        width: 100%;
        background: var(--bgcolor-neutral-primary);
    }
</style>
