<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { isStudio } from '$lib/system';
    export let overlapCover = false;
    export let size: 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

{#if isStudio}
    <slot />
{:else}
    <div style:container-type="inline-size" class:overlap-cover={overlapCover}>
        <div class="console-container" {style}>
            <Layout.Stack gap="l">
                <slot />
            </Layout.Stack>
        </div>
    </div>
{/if}

<style>
    .overlap-cover {
        margin-block-start: -3.5rem;
    }
    :global(.console-container) {
        margin-block: var(--base-32);

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
