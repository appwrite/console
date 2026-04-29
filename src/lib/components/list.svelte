<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children }: { children?: Snippet } = $props();
</script>

<ul class="list">
    {@render children?.()}
</ul>

<style>
    .list {
        gap: 0.25rem;
    }
</style>
