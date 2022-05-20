<script>
    export let dashed = false;
    export let centered = false;
</script>

<article
    class="card common-section u-flex u-flex-vertical"
    class:is-border-dashed={dashed}
    class:u-cross-center={centered}>
    <slot />
</article>
