<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';

    export let size: 'small' | 'medium' | 'large' | 'xl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div class="top-cover-console">
    <div class="cover-container" {style}>
        <Layout.Stack direction="row" alignItems="baseline">
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
        block-size: 152px;
        border-bottom: 1px solid var(--color-border-neutral, #2d2d31);
        background: var(--color-bgcolor-neutral-primary, #1d1d21);
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

        @container (min-width: 360px) {
            margin-inline: 2.5rem;
        }
        @container (min-width: 1024px) {
            margin: 0 auto;
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
