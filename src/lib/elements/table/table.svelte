<script lang="ts">
    export let noOuterStyles = false;
</script>

<div
    class="table is-vertical u-margin-block-start-32"
    class:is-remove-outer-styles={noOuterStyles}
    role="table">
    <slot />
</div>
