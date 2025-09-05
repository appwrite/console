<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    let {
        expanded = false,
        overlapCover = false,
        insideSideSheet = false,
        databasesMainScreen = false,
        expandHeightButton = false,
        size = null,
        children,
        ...restProps
    }: {
        expanded?: boolean;
        overlapCover?: boolean;
        insideSideSheet?: boolean;
        databasesMainScreen?: boolean;
        expandHeightButton?: boolean;
        children?: Snippet;
        size?: 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl' | null;
    } & HTMLAttributes<HTMLDivElement> = $props();

    const style = $derived(
        size
            ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
            : ''
    );
</script>

<div style:container-type="inline-size" class:overlap-cover={overlapCover} {...restProps}>
    <div
        {style}
        class:expanded
        class:insideSideSheet
        class:expandHeightButton
        class:databasesMainScreen
        class="console-container"
    >
        <Layout.Stack gap="l">
            {@render children?.()}
        </Layout.Stack>
    </div>
</div>

<style>
    .overlap-cover {
        z-index: 1;
        margin-block-start: -3.5rem;
    }
    :global(.console-container) {
        margin-block: var(--base-32);

        &.insideSideSheet {
            margin-block: var(--base-20);
        }

        &.expanded {
            max-width: unset;
            margin-inline: 2.75rem;
            padding-inline-end: 0 !important;
            margin-block: var(--base-8) !important;

            @media (min-width: 1440px) {
                margin-inline: 0 !important;
                padding-inline: 53px !important;
            }

            &.expandHeightButton {
                margin-inline-end: unset;
                margin-inline-start: 2.75rem;
                padding-inline-end: 0.5rem !important;
            }

            &:first-child {
                margin-inline: 4rem;

                &.expandHeightButton {
                    margin-inline: 0.5rem;
                    margin-inline-start: 4rem;
                }

                @media (max-width: 768px) {
                    margin-inline: 1rem;

                    &.expandHeightButton {
                        margin-inline-start: 1rem;
                    }
                }
            }
        }

        &.databasesMainScreen {
            @media (min-width: 360px) {
                margin-inline: 1rem;
            }

            @media (min-width: 1024px) {
                margin-inline: auto;
                max-width: 1000px;
            }

            @media (min-width: 1280px) {
                margin-inline: auto;
                max-width: 1144px;
            }

            @media (min-width: 1440px) {
                max-width: 1200px;
            }

            @media (min-width: 1728px) {
                max-width: 1245px;
            }
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
