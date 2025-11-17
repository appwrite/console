<script lang="ts">
    import { onDestroy, onMount, tick } from 'svelte';
    import {
        attachStudioTo,
        ensureStudioComponent,
        hideStudio,
        navigateToRoute
    } from '$lib/studio/studio-widget';

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
            id: 'home',
            props: {}
        });
    });

    onDestroy(() => {
        hideStudio();
    });

    $effect(() => {
        positionStudio();
    });
</script>

<div class="studio-page" bind:this={anchor}></div>

<style>
    .studio-page {
        position: relative;
        width: 100%;
        height: calc(100vh - 48px);
        overflow: scroll;
        background: var(--bgcolor-neutral-primary);
    }
</style>
