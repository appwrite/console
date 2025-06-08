<script lang="ts">
    import { base } from '$app/paths';
    import { Button } from '$lib/elements/forms';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import PinkBackground from '$lib/images/pink-background.svg';
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';

    export let variant: 'gradient' | 'image' = 'gradient';

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

<div
    bind:this={container}
    class:darker={variant === 'image'}
    class="top-banner alert is-action is-action-and-top-sticky">
    {#if variant === 'gradient'}
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
    {:else}
        <div class="centered-image-only">
            <img src={PinkBackground} width="1283" height="1278" alt="" />
        </div>
    {/if}

    <div class="top-banner-content u-color-text-primary">
        <slot />
    </div>

    <Button icon extraCompact class="top-banner-button position" on:click={() => dispatch('close')}>
        <Icon icon={IconX} size="s" />
    </Button>
</div>

<style lang="scss">
    .alert {
        top: 0;
        width: 100%;
        z-index: 100;
        position: fixed;
        padding: 0.8rem;

        &.darker {
            background: var(--bgcolor-neutral-default);
        }
    }

    .centered-image-only {
        top: 0;
        width: 100%;
        height: 100%;
        padding-left: 25vw;
        position: absolute;

        @media (max-width: 768px) {
            & img {
                max-width: 100vw;
            }
        }
    }

    :global(.top-banner-button.position) {
        z-index: 1;
        @media (max-width: 768px) {
            position: absolute;
            padding-block-start: 1rem;
            padding-block-end: 3.7625rem;
        }
    }
</style>
