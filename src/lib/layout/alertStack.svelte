<script lang="ts">
    import { setContext, onMount, onDestroy } from 'svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { afterNavigate } from '$app/navigation';
    import { bannerSpacing } from './headerAlert.svelte';

    // Signal to child HeaderAlert components that layout is managed here
    setContext('isInAlertStack', true);

    let container: HTMLElement | null = null;
    let resizeObserver: ResizeObserver;

    function setNavigationHeight() {
        const alertHeight = container ? container.getBoundingClientRect().height : 0;

        if (alertHeight) {
            bannerSpacing.set(`${alertHeight}px`);
        } else {
            bannerSpacing.set(undefined);
        }

        const header: HTMLHeadingElement = document.querySelector('main > header');
        const sidebar: HTMLElement = document.querySelector('main nav');
        const contentSection: HTMLElement = document.querySelector('main .main-content');

        if (header) {
            header.style.top = `${alertHeight}px`;
        }

        if (sidebar) {
            const headerHeight = header?.getBoundingClientRect().height ?? 0;
            const topOffset = alertHeight + ($isTabletViewport ? 0 : headerHeight);
            sidebar.style.top = `${topOffset}px`;
            sidebar.style.height = `calc(100vh - ${topOffset}px)`;
        }

        if (contentSection) {
            contentSection.style.paddingBlockStart = `${alertHeight}px`;
        }
    }

    onMount(() => {
        if (container) {
            resizeObserver = new ResizeObserver(setNavigationHeight);
            resizeObserver.observe(container);
        }
    });

    onDestroy(() => {
        container = null;
        setNavigationHeight();
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    });

    afterNavigate(() => setNavigationHeight());
</script>

<div bind:this={container} class="alert-stack">
    <slot />
</div>

<style>
    .alert-stack {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 100;
    }
</style>
