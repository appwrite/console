<script lang="ts">
    export let size: 'small' | 'medium' | 'large' | 'xl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div class="top-cover-console">
    <div class="cover-container" {style}>
        <div class="u-flex u-cross-center u-gap-16 u-margin-block-start-20 u-flex-wrap">
            <slot name="header" />
        </div>
        <slot />
    </div>
</div>

<style>
    .top-cover-console {
        container-type: inline-size;
        padding-block-start: var(--base-48, 48px);
        padding-block-end: var(--base-64, 64px);
        border-bottom: 1px solid var(--color-border-neutral, #2d2d31);
        background: var(--color-bgcolor-neutral-primary, #1d1d21);
    }
    .cover-container {
        margin: 0 1rem;

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
