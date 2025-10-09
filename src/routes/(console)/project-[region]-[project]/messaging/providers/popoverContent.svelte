<script lang="ts">
    import { ImagePreview } from '$lib/components';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let lines = [];
    export let image: { src: { dark: string; light: string }; alt: string } | null = null;
</script>

<Layout.Stack direction="column" gap="m" style="max-inline-size: 260px;">
    {#each lines as line}
        <p class="popover-content">{@html line}</p>
    {/each}

    {#if image}
        <Layout.Stack>
            <ImagePreview darkSrc={image.src.dark} lightSrc={image.src.light} alt={image.alt} />
        </Layout.Stack>
    {/if}
</Layout.Stack>

<style>
    :global(.theme-dark) .popover-content {
        color: hsl(var(--color-neutral-20));

        &:first-child {
            color: hsl(var(--color-neutral-10));
        }
    }
</style>
