<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';

    export let overlapCover = false;
    export let expanded = false;
    export let size: 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div style:container-type="inline-size" class:overlap-cover={overlapCover} {...$$restProps}>
    <div class="console-container" class:expanded {style}>
        <Layout.Stack gap="l">
            <slot />
        </Layout.Stack>
    </div>
</div>

<style>
    .overlap-cover {
        margin-block-start: -3.5rem;
    }
    :global(.console-container) {
        margin-block: var(--base-32);

        &.expanded {
            padding-inline-end: 0 !important;
            margin-block: var(--base-8) !important;
        }

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
    }

    :global(main:has(.sub-navigation) .console-container) {
        @media (min-width: 1024px) {
            padding-inline-end: var(--base-32, 32px);
        }
    }
</style>
