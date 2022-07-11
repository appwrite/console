<script lang="ts">
    export let columns: 2 | 'auto' = 'auto';
</script>

<ul class="grid-box common-section" class:columns-2={columns === 2}>
    <slot />
</ul>

<style>
    .grid-box.columns-2 {
        --grid-gap: 2rem;
        --grid-item-size: 25rem;
    }
</style>
