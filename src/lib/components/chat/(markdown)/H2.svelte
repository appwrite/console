<script lang="ts">
    import { Typography } from '@appwrite.io/pink-svelte';

    let { children } = $props();
</script>

<Typography.Title size="s">{@render children?.()}</Typography.Title>
