<script lang="ts">
    export let isTile = false;
    export let isDashed = false;
</script>

<article class="card" class:is-border-dashed={isDashed} class:common-section={!isTile}>
    <slot />
</article>
