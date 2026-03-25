<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children }: { children: Snippet } = $props();
</script>

<div class="hint-badge">
    {@render children()}
</div>

<style>
    .hint-badge {
        height: 44px;
        width: max-content;
        gap: var(--gap-xxs);
        align-items: center;
        display: inline-flex;
        justify-content: center;
        padding: var(--space-5);
        border-radius: var(--border-radius-m);
        background: var(--bgcolor-neutral-primary);
        border: var(--border-width-s) solid var(--border-neutral);
        box-shadow:
            0 1px 3px 0 rgba(0, 0, 0, 0.03),
            0 4px 4px 0 rgba(0, 0, 0, 0.04);
    }
</style>
