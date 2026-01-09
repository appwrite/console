<script lang="ts">
    import { onDestroy, onMount, tick } from 'svelte';
    import {
        attachStudioTo,
        ensureStudioComponent,
        hideStudio,
        navigateToRoute
    } from '$lib/studio/studio-widget';
    import { getPageTitle } from '../../store';
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import type { PageProps } from './$types';
    import { isSmallViewport } from '$lib/stores/viewport';
    import MobileMessage from '$lib/studio/mobileMessage.svelte';

    let { params, data }: PageProps = $props();
    let anchor: HTMLElement = $state();

    function positionStudio() {
        if (!anchor) return;
        attachStudioTo(anchor, { offsetX: 0, offsetY: 0 });
    }

    onMount(async () => {
        if (!$isSmallViewport) {
            ensureStudioComponent();
            await tick();
            positionStudio();
            navigateToRoute({
                id: 'project',
                props: {
                    projectId: params.project,
                    region: params.region
                }
            });
        }
    });

    onDestroy(() => {
        hideStudio();
    });

    $effect(() => {
        if (!$isSmallViewport && anchor) {
            positionStudio();
        }
    });
</script>

<svelte:head>
    <title>{getPageTitle(data.project.name, 'Studio', resolvedProfile.platform)}</title>
</svelte:head>

{#if $isSmallViewport}
    <MobileMessage />
{:else}
    <div class="studio-page" bind:this={anchor}></div>
{/if}

<style>
    .studio-page {
        position: relative;
        width: 100%;
        background: var(--bgcolor-neutral-primary);
    }
</style>
