<script lang="ts">
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>Site - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
