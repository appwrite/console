<script lang="ts">
    export let isTile = false;
    export let isDashed = false;
    export let danger = false;
</script>

<article
    class="card"
    class:is-danger={danger}
    class:is-border-dashed={isDashed}
    class:common-section={!isTile}>
    <slot />
</article>
