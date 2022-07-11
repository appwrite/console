<script lang="ts">
    export let adjustContentToCover = false;
</script>

<div class="top-cover" class:is-adjust-content-to-cover={adjustContentToCover}>
    <div class="container">
        <div class="u-flex u-cross-center u-gap-16 u-margin-block-start-20">
            <slot name="header" />
        </div>
        <slot />
    </div>
</div>
