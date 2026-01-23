<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Tooltip } from '@appwrite.io/pink-svelte';

    const {
        children
    }: {
        children: Snippet;
    } = $props();
</script>

<Tooltip maxWidth="12rem" portal>
    <div>{@render children()}</div>

    <div slot="tooltip">This action is disabled during import.</div>
</Tooltip>
