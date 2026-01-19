<script lang="ts">
    import { onDestroy, tick } from 'svelte';
    import {
        attachStudioTo,
        ensureStudioComponent,
        hideStudio,
        navigateToRoute
    } from '$lib/studio/studio-widget';
    import { getPageTitle } from '../../store';
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import type { PageProps } from './$types';

    let { params, data }: PageProps = $props();
    let anchor: HTMLElement = $state();

    function positionStudio() {
        if (!anchor) return;
        attachStudioTo(anchor, { offsetX: 0, offsetY: 0 });
    }

    async function setStudioParams(props: { projectId: string; region: string }) {
        ensureStudioComponent();
        await tick();
        positionStudio();
        navigateToRoute({
            id: 'project',
            props
        });
    }

    $effect(() => {
        setStudioParams({
            projectId: params.project,
            region: params.region
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
    <title>{getPageTitle(data.project.name, 'Studio', resolvedProfile.platform)}</title>
</svelte:head>

<div class="studio-page" bind:this={anchor}></div>

<style>
    .studio-page {
        position: relative;
        width: 100%;
        background: var(--bgcolor-neutral-primary);
    }
</style>
