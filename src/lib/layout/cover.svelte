<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { isTabletViewport } from '$lib/stores/viewport';

    export let size: 'small' | 'medium' | 'large' | 'xl' = null;
    export let blocksize = '152px';
    export let expanded: boolean = false;
    export let animate: boolean = false;
    export let collapsed: boolean = false;
    export let adjustForSpreadsheet: boolean = false;
    export let databasesMainScreen: boolean = false;

    let isAnimating = false;
    let animationTimeout: ReturnType<typeof setTimeout>;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';

    $: marginTop = expanded && $isTabletViewport ? '48px' : undefined;

    $: animatedBlocksize = animate && collapsed ? '65px' : blocksize;
    $: headerPaddingTop = animate && collapsed ? 'var(--base-16)' : 'var(--base-32)';
    $: headerPaddingBottom = animate && collapsed ? 'var(--base-8)' : 'var(--base-16)';

    $: if (animate) {
        clearTimeout(animationTimeout);
        isAnimating = true;
        animationTimeout = setTimeout(() => {
            isAnimating = false;
        }, 300);
    }
</script>

<div
    class:animate
    class:adjustForSpreadsheet
    class:collapsed={animate && collapsed}
    class="top-cover-console"
    style:margin-top={marginTop}
    style:block-size={animatedBlocksize}
    style:padding-block-start={headerPaddingTop}
    style:padding-block-end={headerPaddingBottom}>
    <div
        class="cover-container"
        {style}
        class:databasesMainScreen
        class:adjustForSpreadsheet
        class:collapsed={animate && collapsed}
        class:animating={isAnimating}>
        <Layout.Stack direction="row" alignItems="baseline">
            <slot name="header" />
        </Layout.Stack>

        {#if $$slots.default}
            <slot />
        {/if}
    </div>
</div>

<style lang="scss">
    .top-cover-console {
        container-type: inline-size;
        border-bottom: 1px solid var(--border-neutral, #2d2d31);
        background: var(--bgcolor-neutral-primary, #1d1d21);
        margin-left: -190px;
        padding-left: 190px;
        position: relative;
        overflow: hidden;

        &.animate {
            transition:
                block-size 300ms cubic-bezier(0.4, 0, 0.2, 1),
                padding-block-start 300ms cubic-bezier(0.4, 0, 0.2, 1),
                padding-block-end 300ms cubic-bezier(0.4, 0, 0.2, 1),
                border-bottom-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        &.collapsed {
            border-bottom-color: var(--border-neutral, #2d2d31);
        }

        &.adjustForSpreadsheet {
            @media (min-width: 1024px) {
                padding-left: calc(190px + 3rem);
            }
        }
    }

    .cover-container {
        position: relative;
        margin: 0 1rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        block-size: 100%;

        @media (min-width: 360px) {
            margin-inline: 1rem;
        }

        @media (min-width: 1024px) {
            margin-inline: auto;
            max-width: calc(944px - 11rem);
        }

        @media (min-width: 1280px) {
            margin-inline: auto;
            max-width: 1000px;
        }

        @media (min-width: 1440px) {
            margin-inline: auto;
            max-width: 1144px;
        }

        @media (min-width: 1728px) {
            margin-inline: auto;
            max-width: 1200px;
        }

        &.animating {
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        &.adjustForSpreadsheet {
            padding-left: 2.5px;
        }

        &.databasesMainScreen {
            @media (min-width: 1024px) {
                margin: unset;
            }
        }
    }
</style>
