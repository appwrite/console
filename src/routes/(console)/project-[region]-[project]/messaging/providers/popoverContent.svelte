<script lang="ts">
    import { ImagePreview } from '$lib/components';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let lines = [];
    export let image: { src: { dark: string; light: string }; alt: string } | null = null;
</script>

<div class="u-flex-vertical u-gap-16 popover-content">
    {#each lines as line}
        <p>{@html line}</p>
    {/each}

    {#if image}
        <Layout.Stack>
            <ImagePreview darkSrc={image.src.dark} lightSrc={image.src.light} alt={image.alt} />
        </Layout.Stack>
    {/if}
</div>

<style>
    .popover-content {
        max-inline-size: 260px;
    }

    div > p {
        color: hsl(var(--color-neutral-50));

        &:first-child {
            color: hsl(var(--color-neutral-70));
        }
    }

    :global(.theme-dark) div > p {
        color: hsl(var(--color-neutral-20));

        &:first-child {
            color: hsl(var(--color-neutral-10));
        }
    }
</style>
