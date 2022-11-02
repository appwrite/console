<script lang="ts">
    export let adjustContentToCover = false;

    export let size: 'small' | 'medium' | 'large' | 'xl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div class="top-cover" class:is-adjust-content-to-cover={adjustContentToCover}>
    <div class="container" {style}>
        <div class="u-flex u-cross-center u-gap-16 u-margin-block-start-20">
            <slot name="header" />
        </div>
        <slot />
    </div>
</div>
