<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    export let overlapCover = false;
    export let size: 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div class="console-container" {style}>
    <Layout.Stack gap="xl">
        <slot />
    </Layout.Stack>
</div>

<!--1728px (and wider): container size is 1200px-->
<!--1440px: container size is 1144px-->
<!--1280px: container size is 1000px-->
<!--1024px (no side navigation): 944px-->
<!--360px (no side navigation): 328px-->

<style>
    :global(.console-container) {
        margin: 1.25rem auto;

        @media (min-width: 360px) {
            width: 328px;
        }
        @media (min-width: 1024px) {
            width: 944px;
        }
        @media (min-width: 1280px) {
            width: 1000px;
        }
        @media (min-width: 1440px) {
            width: 1144px;
        }
        @media (min-width: 1728px) {
            width: 1200px;
        }
    }
</style>
