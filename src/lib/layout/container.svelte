<script lang="ts">
    export let overlapCover = false;
</script>

<div
    class="container"
    class:u-margin-block-start-24={!overlapCover}
    class:u-margin-block-start-negative-56={overlapCover}>
    <slot />
</div>
