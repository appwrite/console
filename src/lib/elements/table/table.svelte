<script>
    export let sticky = false;
</script>

<div class:is-sticky-scroll={sticky} class="table is-vertical u-margin-block-start-32" role="table">
    <slot />
</div>
