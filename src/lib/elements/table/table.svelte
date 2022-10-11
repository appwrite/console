<script lang="ts">
    export let noMargin = false;
    export let noStyles = false;
    export let noMobile = false;
</script>

<div
    class="table is-vertical"
    class:is-vertical={!noMobile}
    class:u-margin-block-start-32={!noMargin}
    class:is-remove-outer-styles={noStyles}
    role="table">
    <slot />
</div>
