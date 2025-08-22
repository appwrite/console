<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';

    // TODO: needs better props

    export let expanded = false;
    export let slotSpacing = false;
    export let overlapCover = false;
    export let paddingInlineEnd = true;
    export let insideSideSheet = false;
    export let databasesScreen = false;
    export let expandHeightButton = false;
    export let size: 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div style:container-type="inline-size" class:overlap-cover={overlapCover} {...$$restProps}>
    <div
        {style}
        class:expanded
        class:slotSpacing
        class:databasesScreen
        class:insideSideSheet
        class:expandHeightButton
        class="console-container"
        class:paddingInlineEnd={!paddingInlineEnd}>
        <Layout.Stack gap="l">
            <slot />
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

            &.slotSpacing {
                padding-block-start: var(--base-32) !important;
            }
        }

        &.paddingInlineEnd {
            @media (min-width: 1024px) {
                padding-inline-end: 2.75rem !important;
            }
        }

        &.databasesScreen {
            @media (min-width: 1440px) {
                min-width: 1070px;
                /*max-width: 1144px;*/
            }

            @media (min-width: 1728px) {
                min-width: 1070px;
                padding-inline: 196px !important;
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
