<script lang="ts">
    import { Box } from '.';
</script>

<Box>
    <div class="u-flex u-gap-16">
        <slot name="image" />
        <div class="u-cross-child-center u-line-height-1-5">
            <slot name="title" />
            <slot />
        </div>
    </div>
</Box>
