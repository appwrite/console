<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    export let overlapCover = false;
    export let size: 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div style:container-type="inline-size" class:overlap-cover={overlapCover}>
    <div class="console-container" {style}>
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
        margin-inline: 1rem;

        @container (min-width: 360px) {
            margin-inline: 2.5rem;
        }
        @container (min-width: 1024px) {
            margin-inline: auto;
            max-width: 944px;
        }
        @container (min-width: 1280px) {
            max-width: 1000px;
        }

        @container (min-width: 1440px) {
            max-width: 1144px;
        }

        @container (min-width: 1728px) {
            max-width: 1200px;
        }
    }
</style>
