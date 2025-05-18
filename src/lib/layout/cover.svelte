<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';

    export let size: 'small' | 'medium' | 'large' | 'xl' = null;
    export let blocksize = '152px';

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div class="top-cover-console" style:block-size={blocksize}>
    <div class="cover-container" {style}>
        <Layout.Stack direction="row" alignItems="center">
            <slot name="header" />
        </Layout.Stack>
        <slot />
    </div>
</div>

<style>
    .top-cover-console {
        container-type: inline-size;
        padding-block-start: var(--base-32);
        padding-block-end: var(--base-16);
        border-bottom: 1px solid var(--border-neutral, #2d2d31);
        background: var(--bgcolor-neutral-primary, #1d1d21);
        margin-left: -190px;
        padding-left: 190px;
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
    }
</style>
