<script lang="ts">
    import { ImagePreview } from '$lib/components';

    export let lines = [];
    export let image: { src: { dark: string; light: string }; alt: string } | null = null;
</script>

<div class="u-flex-vertical u-gap-16">
    {#each lines as line}
        <p>{@html line}</p>
    {/each}

    {#if image}
        <ImagePreview darkSrc={image.src.dark} lightSrc={image.src.light} alt={image.alt} />
    {/if}
</div>

<style>
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
