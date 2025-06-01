<script lang="ts">
    import { base } from '$app/paths';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { Button } from '$lib/elements/forms';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';

    let container: HTMLElement;
    const dispatch = createEventDispatcher();

    const queryLayoutElements = () => ({
        header: document.querySelector<HTMLElement>('main > header'),
        sidebar: document.querySelector<HTMLElement>('main > div > nav'),
        content: document.querySelector<HTMLElement>('main > div > section')
    });

    const setNavigationHeight = () => {
        const alertHeight = container?.getBoundingClientRect()?.height || 0;
        const { header, sidebar, content } = queryLayoutElements();
        const headerHeight = header?.getBoundingClientRect().height || 0;
        const offset = alertHeight + (!isTabletViewport && header ? headerHeight : 0);

        if (header) header.style.top = `${alertHeight}px`;
        if (sidebar) {
            sidebar.style.top = `${offset}px`;
            sidebar.style.height = `calc(100vh - ${offset}px)`;
        }
        if (content) content.style.paddingBlockStart = `${alertHeight}px`;
    };

    onMount(setNavigationHeight);
    onDestroy(setNavigationHeight);
</script>

<svelte:window on:resize={setNavigationHeight} />

<div bind:this={container} class="top-banner alert is-action is-action-and-top-sticky">
    <div class="top-banner-bg">
        <div class="top-banner-bg-1">
            <img
                src={`${base}/images/top-banner/bg-pink-desktop.svg`}
                width="1283"
                height="1278"
                alt="" />
        </div>
        <div class="top-banner-bg-2">
            <img
                src={`${base}/images/top-banner/bg-mint-desktop.svg`}
                width="1051"
                height="1271"
                alt="" />
        </div>
    </div>

    <div class="top-banner-content u-color-text-primary">
        <slot />
    </div>

    <Button icon extraCompact class="top-banner-button position" on:click={() => dispatch('close')}>
        <Icon icon={IconX} size="s" />
    </Button>
</div>

<style>
    .alert {
        top: 0;
        width: 100%;
        z-index: 100;
        position: fixed;
    }

    @media (max-width: 768px) {
        :global(.top-banner-button.position) {
            position: absolute;
            padding-block-end: 3.7625rem;
        }
    }
</style>
