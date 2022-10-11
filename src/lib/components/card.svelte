<script lang="ts">
    export let isTile = false;
</script>

<article class="card" class:common-section={!isTile}>
    <slot />
</article>
