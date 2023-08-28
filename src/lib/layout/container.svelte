<script lang="ts">
    export let overlapCover = false;
    export let size: 'small' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl' = null;

    $: style = size
        ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
        : '';
</script>

<div
    class="container"
    {style}
    class:u-margin-block-start-24={!overlapCover}
    class:u-margin-block-start-negative-56={overlapCover}>
    <slot />
</div>
