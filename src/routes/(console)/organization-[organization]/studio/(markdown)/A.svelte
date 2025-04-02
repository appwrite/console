<script lang="ts">
    import { Link } from '@appwrite.io/pink-svelte';

    let { children, href } = $props();
</script>

<Link.Anchor {href}>{@render children?.()}</Link.Anchor>
