<script lang="ts">
    import { Typography } from '@appwrite.io/pink-svelte';

    let { children } = $props();
</script>

<Typography.Title>{@render children?.()}</Typography.Title>
